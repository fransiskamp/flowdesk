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

const validRoles = [
  "OWNER",
  "ADMIN",
  "MEMBER",
] as const;

type MemberRole = (typeof validRoles)[number];

type MemberRouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: MemberRouteContext,
) {
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

    const { memberId } = await params;
    const body = await request.json();

    const role = body.role as MemberRole;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required." },
        { status: 400 },
      );
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 },
      );
    }

    // Find the target member.
    const existingMember = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        name: users.name,
      })
      .from(workspaceMembers)
      .innerJoin(
        users,
        eq(
          workspaceMembers.userId,
          users.id,
        ),
      )
      .where(
        eq(
          workspaceMembers.id,
          memberId,
        ),
      )
      .limit(1);

    const member = existingMember[0];

    if (!member) {
      return NextResponse.json(
        { error: "Member not found." },
        { status: 404 },
      );
    }

    // Find the authenticated user's membership
    // in the same workspace.
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
            member.workspaceId,
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

    // Only Owner and Admin can change roles.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to change member roles.",
        },
        { status: 403 },
      );
    }

    // The workspace owner cannot have their role changed.
    if (member.role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "The workspace owner's role cannot be changed.",
        },
        { status: 403 },
      );
    }

    // Prevent creating another workspace owner.
    if (role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "A member cannot be promoted to Owner.",
        },
        { status: 403 },
      );
    }

    const [updatedMember] = await db
      .update(workspaceMembers)
      .set({
        role,
      })
      .where(
        eq(
          workspaceMembers.id,
          memberId,
        ),
      )
      .returning({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
      });

    if (member.role !== role) {
      // The authenticated user is the actor.
      await createActivity({
        workspaceId: member.workspaceId,
        userId: session.user.id,
        type: "MEMBER_ROLE_CHANGED",
        description: `Changed ${member.name}'s role from ${member.role} to ${role}`,
      });
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error) {
    console.error(
      "Failed to update member role:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update member role.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: MemberRouteContext,
) {
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

    const { memberId } = await params;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required." },
        { status: 400 },
      );
    }

    // Find the target member.
    const existingMember = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        name: users.name,
      })
      .from(workspaceMembers)
      .innerJoin(
        users,
        eq(
          workspaceMembers.userId,
          users.id,
        ),
      )
      .where(
        eq(
          workspaceMembers.id,
          memberId,
        ),
      )
      .limit(1);

    const member = existingMember[0];

    if (!member) {
      return NextResponse.json(
        { error: "Member not found." },
        { status: 404 },
      );
    }

    // Find the authenticated user's membership
    // in the same workspace.
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
            member.workspaceId,
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

    // Only Owner and Admin can remove members.
    if (
      currentMember.role !== "OWNER" &&
      currentMember.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to remove members.",
        },
        { status: 403 },
      );
    }

    // The workspace owner cannot be removed.
    if (member.role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "The workspace owner cannot be removed.",
        },
        { status: 403 },
      );
    }

    // The authenticated user cannot remove themselves.
    if (member.userId === session.user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot remove yourself from the workspace.",
        },
        { status: 403 },
      );
    }

    // Create activity before deleting the member.
    // The authenticated user is the actor.
    await createActivity({
      workspaceId: member.workspaceId,
      userId: session.user.id,
      type: "MEMBER_REMOVED",
      description: `Removed ${member.name} from the workspace`,
    });

    const [deletedMember] = await db
      .delete(workspaceMembers)
      .where(
        eq(
          workspaceMembers.id,
          memberId,
        ),
      )
      .returning({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
      });

    return NextResponse.json({
      success: true,
      member: deletedMember,
    });
  } catch (error) {
    console.error(
      "Failed to remove member:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to remove member.",
      },
      { status: 500 },
    );
  }
}