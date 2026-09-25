import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
} from "@/db/schema";
import { createActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";

const validStatuses = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

const validPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;

type TaskStatus = (typeof validStatuses)[number];
type TaskPriority = (typeof validPriorities)[number];

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

    const projectId = body.projectId?.trim();
    const title = body.title?.trim();

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const assigneeId =
      typeof body.assigneeId === "string" &&
      body.assigneeId.trim()
        ? body.assigneeId.trim()
        : null;

    const status = (body.status ?? "TODO") as TaskStatus;
    const priority =
      (body.priority ?? "MEDIUM") as TaskPriority;

    let dueDate: Date | null = null;

    if (body.dueDate) {
      const parsedDate = new Date(body.dueDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date." },
          { status: 400 },
        );
      }

      dueDate = parsedDate;
    }

    if (!projectId || !title) {
      return NextResponse.json(
        {
          error:
            "Project ID and task title are required.",
        },
        { status: 400 },
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid task status." },
        { status: 400 },
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid task priority." },
        { status: 400 },
      );
    }

    // Find the project and its workspace.
    const [project] = await db
      .select({
        id: projects.id,
        workspaceId: projects.workspaceId,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
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
            project.workspaceId,
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

    // Only Owner and Admin can create tasks.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create tasks.",
        },
        { status: 403 },
      );
    }

    // If an assignee is provided, make sure the assignee
    // belongs to the same workspace.
    if (assigneeId) {
      const [assigneeMembership] = await db
        .select({
          id: workspaceMembers.id,
        })
        .from(workspaceMembers)
        .where(
          and(
            eq(
              workspaceMembers.workspaceId,
              project.workspaceId,
            ),
            eq(
              workspaceMembers.userId,
              assigneeId,
            ),
          ),
        )
        .limit(1);

      if (!assigneeMembership) {
        return NextResponse.json(
          {
            error:
              "Assignee is not a member of this workspace.",
          },
          { status: 400 },
        );
      }
    }

    // Calculate the next task position.
    const existingTasks = await db
      .select({
        position: tasks.position,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const nextPosition =
      existingTasks.length > 0
        ? Math.max(
            ...existingTasks.map(
              (task) => task.position,
            ),
          ) + 1
        : 0;

    // Create the task.
    const [newTask] = await db
      .insert(tasks)
      .values({
        projectId,
        title,
        description,
        assigneeId,
        status,
        priority,
        dueDate,
        position: nextPosition,
      })
      .returning({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        description: tasks.description,
        assigneeId: tasks.assigneeId,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        position: tasks.position,
        createdAt: tasks.createdAt,
      });

    // Record the authenticated user as the activity actor.
    await createActivity({
      workspaceId: project.workspaceId,
      userId: session.user.id,
      projectId: project.id,
      taskId: newTask.id,
      type: "TASK_CREATED",
      description: `Created task "${newTask.title}"`,
    });

    return NextResponse.json(
      {
        success: true,
        task: newTask,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed to create task:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 },
    );
  }
}