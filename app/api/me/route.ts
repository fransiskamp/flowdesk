import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const [membership] = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: workspaceMembers.role,
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
    )
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);

  if (!membership) {
    return NextResponse.json(
      { error: "Workspace membership not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(membership);
}