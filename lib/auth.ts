import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({
      user,
      url,
    }) => {
      if (!process.env.RESEND_API_KEY) {
        console.error(
          "RESEND_API_KEY is not configured.",
        );
        return;
      }

      const { error } = await resend.emails.send({
        from: "FlowDesk <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your FlowDesk password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0f172a;">
            <h1 style="font-size: 28px; margin-bottom: 12px;">
              Reset your password
            </h1>

            <p style="font-size: 15px; line-height: 1.7; color: #64748b;">
              We received a request to reset the password
              for your FlowDesk account.
            </p>

            <a
              href="${url}"
              style="
                display: inline-block;
                margin-top: 20px;
                padding: 12px 20px;
                border-radius: 10px;
                background: #0f172a;
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
              "
            >
              Reset password
            </a>

            <p style="margin-top: 24px; font-size: 13px; line-height: 1.6; color: #94a3b8;">
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p style="margin-top: 32px; font-size: 13px; color: #94a3b8;">
              FlowDesk
            </p>
          </div>
        `,
      });

      if (error) {
        console.error(
          "Failed to send password reset email:",
          error,
        );
      }
    },

    resetPasswordTokenExpiresIn: 3600,

    revokeSessionsOnPasswordReset: true,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const [workspace] = await db
            .select({
              id: schema.workspaces.id,
            })
            .from(schema.workspaces)
            .where(
              eq(
                schema.workspaces.name,
                "FlowDesk Team",
              ),
            )
            .limit(1);

          if (!workspace) {
            return;
          }

          const [existingMember] = await db
            .select({
              id: schema.workspaceMembers.id,
            })
            .from(schema.workspaceMembers)
            .where(
              eq(
                schema.workspaceMembers.userId,
                user.id,
              ),
            )
            .limit(1);

          if (existingMember) {
            return;
          }

          await db.insert(schema.workspaceMembers).values({
            workspaceId: workspace.id,
            userId: user.id,
            role: "MEMBER",
          });
        },
      },
    },
  },
});