import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

type TaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function TaskDetailPage({
  params,
}: TaskDetailPageProps) {
  const { taskId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [membership] = await db
    .select({
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
    })
    .from(workspaceMembers)
    .innerJoin(
      workspaces,
      eq(workspaceMembers.workspaceId, workspaces.id),
    )
    .where(
      eq(workspaceMembers.userId, session.user.id),
    )
    .limit(1);

  if (!membership) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
              <h1 className="text-xl font-semibold">
                No workspace found
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                You are not a member of any workspace yet.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const [task] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      projectId: projects.id,
      projectName: projects.name,
      assigneeId: users.id,
      assigneeName: users.name,
    })
    .from(tasks)
    .innerJoin(
      projects,
      eq(tasks.projectId, projects.id),
    )
    .leftJoin(
      users,
      eq(tasks.assigneeId, users.id),
    )
    .where(
      and(
        eq(tasks.id, taskId),
        eq(
          projects.workspaceId,
          membership.workspaceId,
        ),
      ),
    )
    .limit(1);

  if (!task) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) {
      return "No date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusStyles = {
    TODO: "bg-slate-800 text-slate-400",
    IN_PROGRESS: "bg-indigo-500/10 text-indigo-400",
    IN_REVIEW: "bg-amber-500/10 text-amber-400",
    DONE: "bg-emerald-500/10 text-emerald-400",
  };

  const priorityStyles = {
    LOW: "bg-emerald-500/10 text-emerald-400",
    MEDIUM: "bg-amber-500/10 text-amber-400",
    HIGH: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/projects"
              className="text-slate-500 transition hover:text-slate-300"
            >
              Projects
            </Link>

            <span className="text-slate-700">
              /
            </span>

            <Link
              href={`/projects/${task.projectId}`}
              className="text-slate-500 transition hover:text-slate-300"
            >
              {task.projectName}
            </Link>

            <span className="text-slate-700">
              /
            </span>

            <span className="truncate text-slate-300">
              {task.title}
            </span>
          </div>

          {/* Task Header */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                  >
                    {task.status.replaceAll("_", " ")}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  {task.title}
                </h1>

                <Link
                  href={`/projects/${task.projectId}`}
                  className="mt-3 inline-flex text-sm text-indigo-400 transition hover:text-indigo-300"
                >
                  {task.projectName}
                </Link>
              </div>

              <Link
                href={`/tasks/${task.id}/edit`}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Edit Task
              </Link>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Description
              </p>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                {task.description ??
                  "No task description available."}
              </p>
            </div>
          </section>

          {/* Task Details */}
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Task Details
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Additional information about this task.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Project */}
              <div>
                <p className="text-xs text-slate-500">
                  Project
                </p>

                <Link
                  href={`/projects/${task.projectId}`}
                  className="mt-2 inline-block text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  {task.projectName}
                </Link>
              </div>

              {/* Assignee */}
              <div>
                <p className="text-xs text-slate-500">
                  Assignee
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {task.assigneeName ? (
                    <>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </div>

                      <span className="text-sm font-medium text-slate-300">
                        {task.assigneeName}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                >
                  {task.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-slate-500">
                  Priority
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-xs text-slate-500">
                  Due Date
                </p>

                <p className="mt-2 text-sm font-medium text-slate-300">
                  {formatDate(task.dueDate)}
                </p>
              </div>

              {/* Created */}
              <div>
                <p className="text-xs text-slate-500">
                  Created
                </p>

                <p className="mt-2 text-sm font-medium text-slate-300">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          </section>

          {/* Back to Project */}
          <div className="mt-6">
            <Link
              href={`/projects/${task.projectId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-300"
            >
              <span>←</span>
              Back to {task.projectName}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}