import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

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
import { EditTaskForm } from "@/components/tasks/edit-task-form";

type EditTaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function EditTaskPage({
  params,
}: EditTaskPageProps) {
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

        <main className="min-w-0 flex-1 lg:ml-64">
          <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
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

  const result = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
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

  const task = result[0];

  if (!task) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="min-w-0 flex-1 lg:ml-64">
          <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
              <p className="text-sm text-red-400">
                Task not found
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                We couldn&apos;t find this task.
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                The task may have been deleted, you may not
                have access to it, or the link is invalid.
              </p>

              <Link
                href="/tasks"
                className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Back to Tasks
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(workspaceMembers)
    .innerJoin(
      users,
      eq(workspaceMembers.userId, users.id),
    )
    .where(
      eq(
        workspaceMembers.workspaceId,
        membership.workspaceId,
      ),
    );

  const formattedDueDate = task.dueDate
    ? task.dueDate.toISOString().split("T")[0]
    : "";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              href="/tasks"
              className="transition hover:text-slate-300"
            >
              Tasks
            </Link>

            <span>/</span>

            <Link
              href={`/projects/${task.projectId}`}
              className="transition hover:text-slate-300"
            >
              {task.projectName}
            </Link>

            <span>/</span>

            <span className="text-slate-300">
              Edit Task
            </span>
          </div>

          {/* Header */}
          <div className="mt-6 border-b border-slate-800 pb-8">
            <p className="text-sm font-medium text-indigo-400">
              {task.projectName}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              Edit Task
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Update task information, assignment, status, and priority.
            </p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <EditTaskForm
              task={{
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: formattedDueDate,
                projectId: task.projectId,
                assigneeId: task.assigneeId,
              }}
              members={members}
            />
          </div>
        </div>
      </main>
    </div>
  );
}