import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  projects,
  users,
  workspaceMembers,
} from "@/db/schema";
import { createActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
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

    const { projectId } = await context.params;

    const body = await request.json();

    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 },
      );
    }

    if (name !== undefined && !name?.trim()) {
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

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid project status." },
        { status: 400 },
      );
    }

    if (
      priority !== undefined &&
      !validPriorities.includes(priority)
    ) {
      return NextResponse.json(
        { error: "Invalid project priority." },
        { status: 400 },
      );
    }

    if (
      startDate &&
      dueDate &&
      new Date(startDate) >
        new Date(dueDate)
    ) {
      return NextResponse.json(
        {
          error:
            "Due date must be after the start date.",
        },
        { status: 400 },
      );
    }

    // Find the project.
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    // Check the authenticated user's membership
    // in the project's workspace.
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
            existingProject.workspaceId,
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

    // Only Owner and Admin can update projects.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update projects.",
        },
        { status: 403 },
      );
    }

    // Check duplicate project names
    // inside the same workspace.
    if (
      name !== undefined &&
      name.trim() !== existingProject.name
    ) {
      const [duplicateProject] = await db
        .select({
          id: projects.id,
        })
        .from(projects)
        .where(
          and(
            eq(
              projects.workspaceId,
              existingProject.workspaceId,
            ),
            eq(
              projects.name,
              name.trim(),
            ),
          ),
        )
        .limit(1);

      if (
        duplicateProject &&
        duplicateProject.id !== projectId
      ) {
        return NextResponse.json(
          {
            error:
              "A project with this name already exists.",
          },
          { status: 409 },
        );
      }
    }

    const updateData: Partial<
      typeof projects.$inferInsert
    > = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description =
        description.trim() || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (startDate !== undefined) {
      updateData.startDate = startDate
        ? new Date(startDate)
        : null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate
        ? new Date(dueDate)
        : null;
    }

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    // The authenticated user is the actor.
    await createActivity({
      workspaceId: existingProject.workspaceId,
      userId: session.user.id,
      projectId: updatedProject.id,
      type: "PROJECT_UPDATED",
      description: `Updated project "${updatedProject.name}"`,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(
      "Failed to update project:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to update project.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
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

    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 },
      );
    }

    // Find the project.
    const [existingProject] = await db
      .select({
        id: projects.id,
        name: projects.name,
        workspaceId: projects.workspaceId,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    // Check the authenticated user's membership
    // in the project's workspace.
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
            existingProject.workspaceId,
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

    // Only Owner and Admin can delete projects.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to delete projects.",
        },
        { status: 403 },
      );
    }

    // Create activity before deleting the project.
    // The authenticated user is the actor.
    await createActivity({
      workspaceId: existingProject.workspaceId,
      userId: session.user.id,
      projectId: existingProject.id,
      type: "PROJECT_DELETED",
      description: `Deleted project "${existingProject.name}"`,
    });

    await db
      .delete(projects)
      .where(eq(projects.id, projectId));

    return NextResponse.json({
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to delete project:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to delete project.",
      },
      { status: 500 },
    );
  }
}