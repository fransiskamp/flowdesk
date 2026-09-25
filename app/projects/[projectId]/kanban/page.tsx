import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Sidebar } from "@/components/dashboard/sidebar";
import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
} from "@/db/schema";
import { auth } from "@/lib/auth";

type KanbanPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function KanbanPage({
  params,
}: KanbanPageProps) {
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
      workspaceId: projects.workspaceId,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    notFound();
  }

  const [membership] = await db
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
          session.user.id,
        ),
      ),
    )
    .limit(1);

  if (!membership) {
    notFound();
  }

  const taskData = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      position: tasks.position,
      assigneeName: users.name,
    })
    .from(tasks)
    .leftJoin(
      users,
      eq(tasks.assigneeId, users.id),
    )
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.position));

  const serializedTasks = taskData.map((task) => ({
    ...task,
    dueDate: task.dueDate?.toISOString() ?? null,
  }));

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
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
              href={`/projects/${project.id}`}
              className="text-slate-500 transition hover:text-slate-300"
            >
              {project.name}
            </Link>

            <span className="text-slate-700">
              /
            </span>

            <span className="text-slate-300">
              Kanban
            </span>
          </div>

          {/* Project Header */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
            <div>
              <p className="mb-2 text-sm font-medium text-indigo-400">
                Project Board
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage project tasks through their workflow.
              </p>
            </div>

            {/* Project Navigation */}
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-6">
              <Link
                href={`/projects/${project.id}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Overview
              </Link>

              <Link
                href={`/projects/${project.id}/kanban`}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
              >
                Kanban
              </Link>
            </div>
          </section>

          {/* Interactive Kanban Board */}
          <section className="mt-6">
            <KanbanBoard
              projectId={project.id}
              tasks={serializedTasks}
            />
          </section>
        </div>
      </main>
    </div>
  );
}