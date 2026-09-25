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

type TaskStatus = (typeof validStatuses)[number];

export async function PATCH(request: Request) {
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

    const taskId = body.taskId;
    const projectId = body.projectId;
    const status = body.status as TaskStatus;
    const position = Number(body.position);

    if (
      !taskId ||
      !projectId ||
      !status ||
      !Number.isInteger(position)
    ) {
      return NextResponse.json(
        {
          error:
            "taskId, projectId, status, and position are required.",
        },
        { status: 400 },
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid task status.",
        },
        { status: 400 },
      );
    }

    if (position < 0) {
      return NextResponse.json(
        {
          error:
            "Position must be a non-negative integer.",
        },
        { status: 400 },
      );
    }

    // Make sure the task belongs to the specified project.
    const [existingTask] = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.projectId, projectId),
        ),
      )
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        {
          error:
            "Task not found or does not belong to this project.",
        },
        { status: 404 },
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
        {
          error: "Project not found.",
        },
        { status: 404 },
      );
    }

    // Check that the authenticated user belongs
    // to the project's workspace.
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

    // All workspace members can move tasks
    // through the Kanban board.
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status,
        position,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.projectId, projectId),
        ),
      )
      .returning({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
        position: tasks.position,
      });

    if (!updatedTask) {
      return NextResponse.json(
        {
          error:
            "Task not found or does not belong to this project.",
        },
        { status: 404 },
      );
    }

    // Only create an activity when the status actually changes.
    if (existingTask.status !== status) {
      await createActivity({
        workspaceId: project.workspaceId,
        userId: session.user.id,
        projectId: project.id,
        taskId: updatedTask.id,
        type: "TASK_STATUS_CHANGED",
        description: `Moved task "${updatedTask.title}" from ${existingTask.status.replaceAll("_", " ")} to ${status.replaceAll("_", " ")}`,
      });
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Failed to update task:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to update task.",
      },
      { status: 500 },
    );
  }
}