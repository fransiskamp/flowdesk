import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq, sql } from "drizzle-orm";

import { Sidebar } from "@/components/dashboard/sidebar";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [membership] = await db
    .select({
      userId: users.id,
      role: workspaceMembers.role,
      workspaceId: workspaceMembers.workspaceId,
    })
    .from(workspaceMembers)
    .innerJoin(
      users,
      eq(workspaceMembers.userId, users.id),
    )
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);

  if (!membership) {
    redirect("/login");
  }

  const canManageProjects =
    membership.role === "OWNER" ||
    membership.role === "ADMIN";

  const projectData = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      taskCount: count(tasks.id),
      completedTaskCount: sql<number>`
        count(*) filter (where ${tasks.status} = 'DONE')
      `,
    })
    .from(projects)
    .leftJoin(
      tasks,
      sql`${tasks.projectId} = ${projects.id}`,
    )
    .where(
      eq(
        projects.workspaceId,
        membership.workspaceId,
      ),
    )
    .groupBy(
      projects.id,
      projects.name,
      projects.description,
      projects.status,
      projects.priority,
      projects.startDate,
      projects.dueDate,
    )
    .orderBy(projects.createdAt);

  const formatDate = (date: Date | null) => {
    if (!date) return "No date";

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
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-indigo-400">
                FlowDesk Workspace
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Projects
              </h1>

              <p className="mt-2 text-slate-400">
                Manage projects across your workspace.
              </p>
            </div>

            {canManageProjects && (
              <CreateProjectButton />
            )}
          </div>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Track progress, priorities, and deadlines.
              </p>
            </div>

            {projectData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-xl">
                  +
                </div>

                <h3 className="mt-4 font-semibold text-white">
                  No projects yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {canManageProjects
                    ? "Create your first project to get started."
                    : "There are no projects available in this workspace yet."}
                </p>

                {canManageProjects && (
                  <div className="mt-5">
                    <CreateProjectButton />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {projectData.map((project) => {
                  const totalTasks = Number(
                    project.taskCount,
                  );

                  const completedTasks = Number(
                    project.completedTaskCount,
                  );

                  const progress =
                    totalTasks > 0
                      ? Math.round(
                          (completedTasks /
                            totalTasks) *
                            100,
                        )
                      : 0;

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <article className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-700 group-hover:bg-slate-900/90 group-hover:shadow-xl group-hover:shadow-black/20">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-xl font-semibold text-white transition group-hover:text-indigo-300">
                              {project.name}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                              {project.description ??
                                "No project description available."}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                              project.priority ===
                              "HIGH"
                                ? "bg-red-500/10 text-red-400"
                                : project.priority ===
                                    "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {project.priority}
                          </span>
                        </div>

                        <div className="mb-6">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              project.status ===
                              "COMPLETED"
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
                        </div>

                        <div className="mb-6">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                              Progress
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

                          <p className="mt-2 text-xs text-slate-500">
                            {completedTasks} of{" "}
                            {totalTasks} tasks completed
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                          <div>
                            <p className="text-xs text-slate-500">
                              Start Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-300">
                              {formatDate(
                                project.startDate,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Due Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-300">
                              {formatDate(
                                project.dueDate,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-5">
                          <div>
                            <p className="text-xs text-slate-500">
                              Total Tasks
                            </p>

                            <p className="mt-1 text-lg font-semibold text-white">
                              {totalTasks}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              Completed
                            </p>

                            <p className="mt-1 text-lg font-semibold text-emerald-400">
                              {completedTasks}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end border-t border-slate-800 pt-4">
                          <span className="text-sm font-medium text-slate-500 transition group-hover:text-indigo-400">
                            View project →
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}