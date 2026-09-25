import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
]);

export const projectPriorityEnum = pgEnum("project_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_DELETED",
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_STATUS_CHANGED",
  "TASK_DELETED",
  "MEMBER_INVITED",
  "MEMBER_ROLE_CHANGED",
  "MEMBER_REMOVED",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),
  image: text("image"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp(
      "access_token_expires_at",
    ),
    refreshTokenExpiresAt: timestamp(
      "refresh_token_expires_at",
    ),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(
      table.identifier,
    ),
  ],
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  role: workspaceRoleEnum("role")
    .default("MEMBER")
    .notNull(),
  joinedAt: timestamp("joined_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status")
    .default("PLANNING")
    .notNull(),
  priority: projectPriorityEnum("priority")
    .default("MEDIUM")
    .notNull(),
  startDate: timestamp("start_date", {
    withTimezone: true,
  }),
  dueDate: timestamp("due_date", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, {
      onDelete: "cascade",
    }),
  assigneeId: uuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status")
    .default("TODO")
    .notNull(),
  priority: taskPriorityEnum("priority")
    .default("MEDIUM")
    .notNull(),
  dueDate: timestamp("due_date", {
    withTimezone: true,
  }),
  position: integer("position")
    .default(0)
    .notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),

  taskId: uuid("task_id").references(() => tasks.id, {
    onDelete: "set null",
  }),

  type: activityTypeEnum("type").notNull(),

  description: text("description").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});