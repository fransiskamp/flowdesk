import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";

import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { EditProjectButton } from "@/components/projects/edit-project-button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
} from "@/db/schema";
import { auth } from "@/lib/auth";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      workspaceId: projects.workspaceId,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <Link
              href="/projects"
              className="text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              ← Back to Projects
            </Link>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <h1 className="text-2xl font-semibold">
                Project not found
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                The project you are looking for does not exist.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const [membership] = await db
    .select({
      role: workspaceMembers.role,
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
          session.user.id,
        ),
      ),
    )
    .limit(1);

  if (!membership) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <Link
              href="/projects"
              className="text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              ← Back to Projects
            </Link>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <h1 className="text-2xl font-semibold">
                Access denied
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                You do not have access to this project.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const canManageProjects =
    membership.role === "OWNER" ||
    membership.role === "ADMIN";

  const canCreateTasks =
    membership.role === "OWNER" ||
    membership.role === "ADMIN";

  const taskData = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assigneeName: users.name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.position, tasks.createdAt);

  const [totalTaskResult] = await db
    .select({
      count: count(tasks.id),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const [completedTaskResult] = await db
    .select({
      count: count(tasks.id),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.status, "DONE"),
      ),
    );

  const totalTasks = Number(
    totalTaskResult?.count ?? 0,
  );

  const completedTasks = Number(
    completedTaskResult?.count ?? 0,
  );

  const progress =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100,
        )
      : 0;

  const taskStatusCounts = {
    TODO: taskData.filter(
      (task) => task.status === "TODO",
    ).length,

    IN_PROGRESS: taskData.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length,

    IN_REVIEW: taskData.filter(
      (task) => task.status === "IN_REVIEW",
    ).length,

    DONE: taskData.filter(
      (task) => task.status === "DONE",
    ).length,
  };

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

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="mb-6">
            <Link
              href="/projects"
              className="text-sm text-slate-500 transition hover:text-indigo-400"
            >
              Projects
            </Link>

            <span className="mx-2 text-slate-700">
              /
            </span>

            <span className="text-sm text-slate-400">
              {project.name}
            </span>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      project.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : project.status ===
                            "IN_PROGRESS"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : project.status ===
                              "PLANNING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {project.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      project.priority === "HIGH"
                        ? "bg-red-500/10 text-red-400"
                        : project.priority ===
                            "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {project.priority} PRIORITY
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {project.name}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                  {project.description ??
                    "No project description available."}
                </p>
              </div>

              {canManageProjects && (
                <div className="flex shrink-0 flex-wrap gap-3">
                  <EditProjectButton
                    project={{
                      id: project.id,
                      name: project.name,
                      description: project.description,
                      status: project.status,
                      priority: project.priority,
                      startDate: project.startDate,
                      dueDate: project.dueDate,
                    }}
                  />

                  <DeleteProjectButton
                    projectId={project.id}
                    projectName={project.name}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">
                  Start Date
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {formatDate(project.startDate)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">
                  Due Date
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {formatDate(project.dueDate)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {totalTasks}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {completedTasks}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">
                  Project Progress
                </p>

                <p className="text-sm font-semibold text-white">
                  {progress}%
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <div className="mt-8 border-b border-slate-800">
            <div className="flex gap-6">
              <Link
                href={`/projects/${project.id}`}
                className="border-b-2 border-indigo-500 px-1 pb-3 text-sm font-medium text-indigo-400"
              >
                Overview
              </Link>

              <Link
                href={`/projects/${project.id}/kanban`}
                className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-slate-500 transition hover:text-slate-300"
              >
                Kanban
              </Link>
            </div>
          </div>

          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                Task Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current task distribution in this project.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  To Do
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {taskStatusCounts.TODO}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-indigo-400">
                  {taskStatusCounts.IN_PROGRESS}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  In Review
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {taskStatusCounts.IN_REVIEW}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Done
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {taskStatusCounts.DONE}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 pb-10">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Project Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage tasks belonging to this project.
                </p>
              </div>

              {canCreateTasks && (
                <Link
                  href={`/projects/${project.id}/tasks/new`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <span className="text-base leading-none">
                    +
                  </span>

                  Add Task
                </Link>
              )}
            </div>

            {taskData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-xl">
                  +
                </div>

                <h3 className="mt-4 font-semibold text-white">
                  No tasks yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {canCreateTasks
                    ? "Add your first task to start managing this project."
                    : "There are no tasks in this project yet."}
                </p>

                {canCreateTasks && (
                  <div className="mt-5">
                    <Link
                      href={`/projects/${project.id}/tasks/new`}
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                    >
                      Add Task
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                  {taskData.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block transition hover:bg-slate-800/40"
                    >
                      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-white">
                            {task.title}
                          </h3>

                          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                            {task.description ??
                              "No task description."}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>
                              Assignee:{" "}
                              <span className="text-slate-300">
                                {task.assigneeName ??
                                  "Unassigned"}
                              </span>
                            </span>

                            <span>
                              Due:{" "}
                              <span className="text-slate-300">
                                {formatDate(
                                  task.dueDate,
                                )}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              task.status === "DONE"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : task.status ===
                                    "IN_PROGRESS"
                                  ? "bg-indigo-500/10 text-indigo-400"
                                  : task.status ===
                                      "IN_REVIEW"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {task.status.replaceAll(
                              "_",
                              " ",
                            )}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              task.priority === "HIGH"
                                ? "bg-red-500/10 text-red-400"
                                : task.priority ===
                                    "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}