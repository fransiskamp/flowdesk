import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

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

type ActivityPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const ACTIVITIES_PER_PAGE = 5;

function formatActivityDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getActivityLabel(
  type: (typeof activities.type.enumValues)[number],
) {
  const labels = {
    PROJECT_CREATED: "Project Created",
    PROJECT_UPDATED: "Project Updated",
    PROJECT_DELETED: "Project Deleted",
    TASK_CREATED: "Task Created",
    TASK_UPDATED: "Task Updated",
    TASK_STATUS_CHANGED: "Task Status Changed",
    TASK_DELETED: "Task Deleted",
    MEMBER_INVITED: "Member Invited",
    MEMBER_ROLE_CHANGED: "Member Role Changed",
    MEMBER_REMOVED: "Member Removed",
  };

  return labels[type];
}

function getActivityStyle(
  type: (typeof activities.type.enumValues)[number],
) {
  if (type.startsWith("PROJECT_")) {
    return "bg-indigo-500/10 text-indigo-400";
  }

  if (type.startsWith("TASK_")) {
    return "bg-emerald-500/10 text-emerald-400";
  }

  return "bg-amber-500/10 text-amber-400";
}

export default async function ActivityPage({
  searchParams,
}: ActivityPageProps) {
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
          <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
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

  const activityData = await db
    .select({
      id: activities.id,
      type: activities.type,
      description: activities.description,
      createdAt: activities.createdAt,
      userName: users.name,
      projectName: projects.name,
      taskTitle: tasks.title,
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
    .leftJoin(
      tasks,
      eq(activities.taskId, tasks.id),
    )
    .where(
      eq(
        activities.workspaceId,
        membership.workspaceId,
      ),
    )
    .orderBy(desc(activities.createdAt));

  const totalActivities = activityData.length;
  const totalPages = Math.ceil(
    totalActivities / ACTIVITIES_PER_PAGE,
  );

  const requestedPage = Number(page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= Math.max(totalPages, 1)
      ? Math.floor(requestedPage)
      : 1;

  const startIndex =
    (currentPage - 1) * ACTIVITIES_PER_PAGE;

  const paginatedActivities = activityData.slice(
    startIndex,
    startIndex + ACTIVITIES_PER_PAGE,
  );

  const showingFrom =
    totalActivities === 0 ? 0 : startIndex + 1;

  const showingTo = Math.min(
    startIndex + ACTIVITIES_PER_PAGE,
    totalActivities,
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
          {/* Header */}
          <div className="border-b border-slate-800 pb-8">
            <p className="text-sm font-medium text-indigo-400">
              {membership.workspaceName}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Activity
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Keep track of recent activity across your workspace.
            </p>
          </div>

          {/* Activity List */}
          <section className="mt-8">
            {activityData.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                  •
                </div>

                <h2 className="mt-4 font-semibold text-white">
                  No activity yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Activity from projects, tasks, and members
                  will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="divide-y divide-slate-800">
                    {paginatedActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 px-6 py-5 transition hover:bg-slate-900"
                      >
                        {/* Activity Indicator */}
                        <div className="flex shrink-0 pt-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 ring-4 ring-indigo-500/10" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <span
                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${getActivityStyle(
                                  activity.type,
                                )}`}
                              >
                                {getActivityLabel(
                                  activity.type,
                                )}
                              </span>

                              <p className="mt-3 text-sm leading-6 text-slate-300">
                                {activity.description}
                              </p>
                            </div>

                            <p className="shrink-0 text-xs text-slate-500">
                              {formatActivityDate(
                                activity.createdAt,
                              )}
                            </p>
                          </div>

                          {/* Related Data */}
                          {(activity.userName ||
                            activity.projectName ||
                            activity.taskTitle) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {activity.userName && (
                                <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                                  {activity.userName}
                                </span>
                              )}

                              {activity.projectName && (
                                <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                                  Project:{" "}
                                  {activity.projectName}
                                </span>
                              )}

                              {activity.taskTitle && (
                                <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                                  Task:{" "}
                                  {activity.taskTitle}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing {showingFrom}–{showingTo} of{" "}
                      {totalActivities} activities
                    </p>

                    <div className="flex items-center gap-2">
                      {currentPage > 1 ? (
                        <a
                          href={`/activity?page=${currentPage - 1}`}
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
                          href={`/activity?page=${pageNumber}`}
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
                          href={`/activity?page=${currentPage + 1}`}
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
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}