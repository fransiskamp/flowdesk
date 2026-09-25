import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { Sidebar } from "@/components/dashboard/sidebar";
import { EditRoleButton } from "@/components/members/edit-role-button";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { RemoveMemberButton } from "@/components/members/remove-member-button";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
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

const roleStyles = {
  OWNER: "bg-indigo-500/10 text-indigo-400",
  ADMIN: "bg-amber-500/10 text-amber-400",
  MEMBER: "bg-slate-500/10 text-slate-300",
};

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default async function MembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const memberData = await db
    .select({
      id: workspaceMembers.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
    })
    .from(workspaceMembers)
    .innerJoin(
      users,
      eq(workspaceMembers.userId, users.id),
    )
    .innerJoin(
      workspaces,
      eq(workspaceMembers.workspaceId, workspaces.id),
    );

  const currentMember = memberData.find(
    (member) => member.userId === session.user.id,
  );

  if (!currentMember) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
              <h1 className="text-xl font-semibold text-white">
                Workspace access required
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Your account is not currently connected to a workspace.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const workspaceId = currentMember.workspaceId;
  const workspaceName = currentMember.workspaceName;
  const currentRole = currentMember.role;

  const canManageMembers =
    currentRole === "OWNER" ||
    currentRole === "ADMIN";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-5 border-b border-slate-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                {workspaceName}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Members
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage people who have access to your workspace.
              </p>
            </div>

            {canManageMembers && (
              <InviteMemberDialog
                workspaceId={workspaceId}
              />
            )}
          </div>

          {/* Summary */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">
                Total Members
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {memberData.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">
                Admins
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {
                  memberData.filter(
                    (member) =>
                      member.role === "OWNER" ||
                      member.role === "ADMIN",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">
                Regular Members
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {
                  memberData.filter(
                    (member) => member.role === "MEMBER",
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Members */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">
                Workspace Members
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Everyone currently connected to{" "}
                {workspaceName}.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {memberData.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* User */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-400">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {member.name}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Member Meta */}
                  <div className="flex flex-wrap items-center gap-5 sm:justify-end">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        roleStyles[member.role]
                      }`}
                    >
                      {roleLabels[member.role]}
                    </span>

                    <div className="min-w-[90px] text-right">
                      <p className="text-xs text-slate-600">
                        Joined
                      </p>

                      <p className="text-sm text-slate-400">
                        {formatDate(member.joinedAt)}
                      </p>
                    </div>

                    {canManageMembers &&
                      member.role !== "OWNER" && (
                        <div className="flex items-center gap-1">
                          <EditRoleButton
                            memberId={member.id}
                            memberName={member.name}
                            currentRole={member.role}
                          />

                          <RemoveMemberButton
                            memberId={member.id}
                            memberName={member.name}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}