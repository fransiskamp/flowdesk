import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  workspaceMembers,
} from "@/db/schema";
import { createActivity } from "@/lib/activity";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Check authentication.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const workspaceId = body.workspaceId?.trim();
    const role = body.role ?? "MEMBER";

    if (!name || !email || !workspaceId) {
      return NextResponse.json(
        {
          error:
            "Name, email, and workspaceId are required.",
        },
        { status: 400 },
      );
    }

    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role.",
        },
        { status: 400 },
      );
    }

    // Check the current user's membership in this workspace.
    const [currentMember] = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(
            workspaceMembers.workspaceId,
            workspaceId,
          ),
          eq(
            workspaceMembers.userId,
            session.user.id,
          ),
        ),
      )
      .limit(1);

    if (!currentMember) {
      return NextResponse.json(
        {
          error:
            "You are not a member of this workspace.",
        },
        { status: 403 },
      );
    }

    // Only Owner and Admin can invite members.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to invite members.",
        },
        { status: 403 },
      );
    }

    // Prevent creating another Owner.
    if (role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "A new member cannot be invited as Owner.",
        },
        { status: 403 },
      );
    }

    // Check whether the user already exists.
    const existingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      // Create a new user record.
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      userId = newUser.id;
    }

    // Check whether the user is already a member.
    const existingMembership = await db
      .select({
        id: workspaceMembers.id,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(
            workspaceMembers.workspaceId,
            workspaceId,
          ),
          eq(
            workspaceMembers.userId,
            userId,
          ),
        ),
      )
      .limit(1);

    if (existingMembership.length > 0) {
      return NextResponse.json(
        {
          error:
            "This user is already a member of the workspace.",
        },
        { status: 409 },
      );
    }

    const [membership] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId,
        role,
      })
      .returning({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
      });

    // The authenticated user is the actor.
    await createActivity({
      workspaceId,
      userId: session.user.id,
      type: "MEMBER_INVITED",
      description: `Invited ${name} as ${role}`,
    });

    return NextResponse.json(
      {
        success: true,
        member: membership,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed to invite member:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to invite member.",
      },
      { status: 500 },
    );
  }
}