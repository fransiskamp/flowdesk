import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

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

type TasksPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const TASKS_PER_PAGE = 5;

export default async function TasksPage({
  searchParams,
}: TasksPageProps) {
  const { page } = await searchParams;

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
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
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

  const taskData = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      projectId: projects.id,
      projectName: projects.name,
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
      eq(
        projects.workspaceId,
        membership.workspaceId,
      ),
    )
    .orderBy(desc(tasks.createdAt));

  const formatDate = (date: Date | null) => {
    if (!date) {
      return "No due date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalTasks = taskData.length;

  const todoTasks = taskData.filter(
    (task) => task.status === "TODO",
  ).length;

  const inProgressTasks = taskData.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const completedTasks = taskData.filter(
    (task) => task.status === "DONE",
  ).length;

  const totalPages = Math.ceil(
    totalTasks / TASKS_PER_PAGE,
  );

  const requestedPage = Number(page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= Math.max(totalPages, 1)
      ? Math.floor(requestedPage)
      : 1;

  const startIndex =
    (currentPage - 1) * TASKS_PER_PAGE;

  const paginatedTasks = taskData.slice(
    startIndex,
    startIndex + TASKS_PER_PAGE,
  );

  const showingFrom =
    totalTasks === 0 ? 0 : startIndex + 1;

  const showingTo = Math.min(
    startIndex + TASKS_PER_PAGE,
    totalTasks,
  );

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
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-indigo-400">
              {membership.workspaceName}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Tasks
            </h1>

            <p className="mt-2 text-slate-400">
              Manage and track tasks across your projects.
            </p>
          </div>

          {/* Task Summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total Tasks
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalTasks}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                To Do
              </p>

              <p className="mt-2 text-3xl font-bold">
                {todoTasks}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold">
                {inProgressTasks}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold">
                {completedTasks}
              </p>
            </div>
          </div>

          {/* Tasks */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                All Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Latest tasks across your workspace.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {taskData.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-xl">
                    ✓
                  </div>

                  <h3 className="mt-4 font-semibold text-white">
                    No tasks yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Tasks created inside your projects will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] gap-6 border-b border-slate-800 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
                    <div>Task</div>
                    <div>Project</div>
                    <div>Assignee</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div>Due Date</div>
                  </div>

                  {/* Task Rows */}
                  {paginatedTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`grid gap-4 px-6 py-5 transition hover:bg-slate-800/30 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] lg:items-center lg:gap-6 ${
                        index !== paginatedTasks.length - 1
                          ? "border-b border-slate-800"
                          : ""
                      }`}
                    >
                      {/* Task */}
                      <div className="min-w-0">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="group block"
                        >
                          <p className="truncate font-medium text-white transition group-hover:text-indigo-400">
                            {task.title}
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm text-slate-500 transition group-hover:text-slate-400">
                            {task.description ??
                              "No description available."}
                          </p>

                          <p className="mt-2 text-xs text-slate-600 lg:hidden">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </Link>
                      </div>

                      {/* Project */}
                      <div>
                        <p className="text-xs text-slate-500 lg:hidden">
                          Project
                        </p>

                        <Link
                          href={`/projects/${task.projectId}`}
                          className="mt-1 inline-block text-sm text-slate-300 transition hover:text-indigo-400 lg:mt-0"
                        >
                          {task.projectName}
                        </Link>
                      </div>

                      {/* Assignee */}
                      <div>
                        <p className="text-xs text-slate-500 lg:hidden">
                          Assignee
                        </p>

                        <div className="mt-1 flex items-center gap-2 lg:mt-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-400">
                            {task.assigneeName
                              ? task.assigneeName
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>

                          <span className="truncate text-sm text-slate-300">
                            {task.assigneeName ??
                              "Unassigned"}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="mb-1 text-xs text-slate-500 lg:hidden">
                          Status
                        </p>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                        >
                          {task.status.replaceAll(
                            "_",
                            " ",
                          )}
                        </span>
                      </div>

                      {/* Priority */}
                      <div>
                        <p className="mb-1 text-xs text-slate-500 lg:hidden">
                          Priority
                        </p>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div>
                        <p className="mb-1 text-xs text-slate-500 lg:hidden">
                          Due Date
                        </p>

                        <p className="text-xs text-slate-500 lg:text-sm lg:text-slate-400">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {showingFrom}–{showingTo} of{" "}
                  {totalTasks} tasks
                </p>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <a
                      href={`/tasks?page=${currentPage - 1}`}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-700 hover:text-white"
                    >
                      Previous
                    </a>
                  ) : (
                    <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-700">
                      Previous
                    </span>
                  )}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <a
                      key={pageNumber}
                      href={`/tasks?page=${pageNumber}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
                        pageNumber === currentPage
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </a>
                  ))}

                  {currentPage < totalPages ? (
                    <a
                      href={`/tasks?page=${currentPage + 1}`}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-700 hover:text-white"
                    >
                      Next
                    </a>
                  ) : (
                    <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-700">
                      Next
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}