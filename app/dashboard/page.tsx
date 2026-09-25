import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, desc, eq, lt, ne } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { db } from "@/db";
import {
  activities,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

const statusStyles = {
  TODO: "bg-slate-500/10 text-slate-400",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-400",
  IN_REVIEW: "bg-amber-500/10 text-amber-400",
  DONE: "bg-emerald-500/10 text-emerald-400",
};

const statusLabels = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Completed",
};

const priorityStyles = {
  LOW: "text-slate-500",
  MEDIUM: "text-amber-400",
  HIGH: "text-rose-400",
};

export default async function DashboardPage() {
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

  const workspaceId = membership.workspaceId;

  const projectData = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      dueDate: projects.dueDate,
    })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.updatedAt));

  const projectProgress = await Promise.all(
    projectData.map(async (project) => {
      const [taskCount] = await db
        .select({
          total: count(tasks.id),
        })
        .from(tasks)
        .where(eq(tasks.projectId, project.id));

      const [completedCount] = await db
        .select({
          total: count(tasks.id),
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.projectId, project.id),
            eq(tasks.status, "DONE"),
          ),
        );

      const total = Number(taskCount.total);
      const completed = Number(completedCount.total);

      const progress =
        total === 0
          ? 0
          : Math.round((completed / total) * 100);

      return {
        ...project,
        total,
        completed,
        progress,
      };
    }),
  );

  const [projectCount] = await db
    .select({
      total: count(projects.id),
    })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));

  const [activeTaskCount] = await db
    .select({
      total: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(
      projects,
      eq(tasks.projectId, projects.id),
    )
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        ne(tasks.status, "DONE"),
      ),
    );

  const [completedTaskCount] = await db
    .select({
      total: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(
      projects,
      eq(tasks.projectId, projects.id),
    )
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        eq(tasks.status, "DONE"),
      ),
    );

  const [overdueTaskCount] = await db
    .select({
      total: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(
      projects,
      eq(tasks.projectId, projects.id),
    )
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        ne(tasks.status, "DONE"),
        lt(tasks.dueDate, new Date()),
      ),
    );

  const recentTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
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
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(tasks.updatedAt))
    .limit(5);

  const recentActivities = await db
    .select({
      id: activities.id,
      type: activities.type,
      description: activities.description,
      createdAt: activities.createdAt,
      userName: users.name,
      projectName: projects.name,
    })
    .from(activities)
    .leftJoin(
      users,
      eq(activities.userId, users.id),
    )
    .leftJoin(
      projects,
      eq(activities.projectId, projects.id),
    )
    .where(eq(activities.workspaceId, workspaceId))
    .orderBy(desc(activities.createdAt))
    .limit(5);

  const totalTasks =
    Number(activeTaskCount.total) +
    Number(completedTaskCount.total);

  const completedPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (Number(completedTaskCount.total) /
            totalTasks) *
            100,
        );

  const topProjects = projectProgress.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-5 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                {membership.workspaceName}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {getGreeting()}, {session.user.name} 👋
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Here&apos;s what&apos;s happening across your
                workspace today.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-slate-300">
                {formatDate(new Date())}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Workspace overview
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Projects
                </p>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-400">
                  P
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {Number(projectCount.total)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across this workspace
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Active Tasks
                </p>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-400">
                  A
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {Number(activeTaskCount.total)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tasks still in progress
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Completed
                </p>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                  ✓
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {completedPercentage}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Overall task completion
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Overdue
                </p>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-xs font-semibold text-rose-400">
                  !
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {Number(overdueTaskCount.total)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Active tasks past due
              </p>
            </div>
          </div>

          {/* Main Overview */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            {/* Project Progress */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h2 className="font-semibold text-white">
                    Project Progress
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track how your projects are moving forward.
                  </p>
                </div>

                <Link
                  href="/projects"
                  className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-800">
                {topProjects.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No projects yet.
                    </p>
                  </div>
                ) : (
                  topProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block px-6 py-5 transition hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {project.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {project.completed} of{" "}
                            {project.total} tasks completed
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold text-slate-300">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h2 className="font-semibold text-white">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest changes in your workspace.
                  </p>
                </div>

                <Link
                  href="/activity"
                  className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-800">
                {recentActivities.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No activity yet.
                    </p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 px-6 py-4"
                    >
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400 ring-4 ring-indigo-500/10" />

                      <div className="min-w-0">
                        <p className="text-sm leading-5 text-slate-300">
                          {activity.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {activity.projectName
                            ? `${activity.projectName} · `
                            : ""}
                          {formatRelativeTime(
                            activity.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Recent Tasks */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="font-semibold text-white">
                  Recent Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tasks that were updated most recently.
                </p>
              </div>

              <Link
                href="/tasks"
                className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                View all →
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">
                  No tasks yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="block truncate text-sm font-medium text-white transition hover:text-indigo-400"
                      >
                        {task.title}
                      </Link>

                      <Link
                        href={`/projects/${task.projectId}`}
                        className="mt-1 block truncate text-xs text-slate-500 transition hover:text-slate-300"
                      >
                        {task.projectName}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          statusStyles[task.status]
                        }`}
                      >
                        {statusLabels[task.status]}
                      </span>

                      <span
                        className={`text-xs font-medium ${
                          priorityStyles[task.priority]
                        }`}
                      >
                        {task.priority.toLowerCase()}
                      </span>

                      {task.assigneeName && (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-semibold text-indigo-400">
                            {task.assigneeName
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <span className="text-xs text-slate-400">
                            {task.assigneeName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}