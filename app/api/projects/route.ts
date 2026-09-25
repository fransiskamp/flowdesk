import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  projects,
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import { createActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Check authentication.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 },
      );
    }

    const validStatuses = [
      "PLANNING",
      "IN_PROGRESS",
      "COMPLETED",
      "ARCHIVED",
    ];

    const validPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid project status." },
        { status: 400 },
      );
    }

    if (
      priority &&
      !validPriorities.includes(priority)
    ) {
      return NextResponse.json(
        { error: "Invalid project priority." },
        { status: 400 },
      );
    }

    const projectName = name.trim();

    // Find the FlowDesk workspace.
    const [workspace] = await db
      .select({
        id: workspaces.id,
      })
      .from(workspaces)
      .where(eq(workspaces.slug, "flowdesk-team"))
      .limit(1);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 },
      );
    }

    // Check the authenticated user's membership
    // in the FlowDesk workspace.
    const [currentMember] = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        userId: users.id,
      })
      .from(workspaceMembers)
      .innerJoin(
        users,
        eq(
          workspaceMembers.userId,
          users.id,
        ),
      )
      .where(
        and(
          eq(
            workspaceMembers.workspaceId,
            workspace.id,
          ),
          eq(
            workspaceMembers.userId,
            session.user.id,
          ),
        ),
      )
      .limit(1);

    if (!currentMember) {
      return NextResponse.json(
        {
          error:
            "You are not a member of this workspace.",
        },
        { status: 403 },
      );
    }

    // Only Owner and Admin can create projects.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create projects.",
        },
        { status: 403 },
      );
    }

    // Check for duplicate project names
    // inside this workspace.
    const existingProject = await db
      .select({
        id: projects.id,
      })
      .from(projects)
      .where(
        and(
          eq(
            projects.workspaceId,
            workspace.id,
          ),
          eq(
            projects.name,
            projectName,
          ),
        ),
      )
      .limit(1);

    if (existingProject.length > 0) {
      return NextResponse.json(
        {
          error:
            "A project with this name already exists.",
        },
        { status: 409 },
      );
    }

    const [project] = await db
      .insert(projects)
      .values({
        workspaceId: workspace.id,
        name: projectName,
        description:
          description?.trim() || null,
        status: status ?? "PLANNING",
        priority: priority ?? "MEDIUM",
        startDate: startDate
          ? new Date(startDate)
          : null,
        dueDate: dueDate
          ? new Date(dueDate)
          : null,
      })
      .returning();

    // The authenticated user is the actor.
    await createActivity({
      workspaceId: workspace.id,
      userId: session.user.id,
      projectId: project.id,
      type: "PROJECT_CREATED",
      description: `Created project "${project.name}"`,
    });

    return NextResponse.json(project, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Failed to create project:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to create project.",
      },
      { status: 500 },
    );
  }
}