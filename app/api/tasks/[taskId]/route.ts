import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { createActivity } from "@/lib/activity";

const validStatuses = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

const validPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

type TaskStatus = (typeof validStatuses)[number];
type TaskPriority = (typeof validPriorities)[number];

type TaskRouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: TaskRouteContext,
) {
  try {
    const { taskId } = await params;
    const body = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required." },
        { status: 400 },
      );
    }

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

    const status = body.status as TaskStatus;
    const priority = body.priority as TaskPriority;

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

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
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

    const [existingTask] = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 },
      );
    }

    const [project] = await db
      .select({
        id: projects.id,
        workspaceId: projects.workspaceId,
      })
      .from(projects)
      .where(eq(projects.id, existingTask.projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        title,
        description,
        assigneeId,
        status,
        priority,
        dueDate,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        description: tasks.description,
        assigneeId: tasks.assigneeId,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        updatedAt: tasks.updatedAt,
      });

    await createActivity({
      workspaceId: project.workspaceId,
      projectId: project.id,
      taskId: updatedTask.id,
      type: "TASK_UPDATED",
      description: `Updated task "${updatedTask.title}"`,
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Failed to update task:", error);

    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 },
    );
  }
}