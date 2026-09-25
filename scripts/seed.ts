import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { db } from "@/db";
import {
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

const seed = async () => {
  console.log("🌱 Starting database seed...");

  // =========================================
  // FIXED IDs
  // =========================================

  const siskaId = "00000000-0000-0000-0000-000000000001";
  const argaId = "00000000-0000-0000-0000-000000000002";
  const nayaId = "00000000-0000-0000-0000-000000000003";

  const workspaceId = "00000000-0000-0000-0000-000000000100";

  const websiteProjectId = "00000000-0000-0000-0000-000000000201";
  const mobileProjectId = "00000000-0000-0000-0000-000000000202";

  // =========================================
  // USERS
  // =========================================

  await db
    .insert(users)
    .values([
      {
        id: siskaId,
        name: "Siska",
        email: "siska@flowdesk.dev",
      },
      {
        id: argaId,
        name: "Arga",
        email: "arga@flowdesk.dev",
      },
      {
        id: nayaId,
        name: "Naya",
        email: "naya@flowdesk.dev",
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Users seeded");

  // =========================================
  // WORKSPACE
  // =========================================

  await db
    .insert(workspaces)
    .values({
      id: workspaceId,
      name: "FlowDesk Team",
      slug: "flowdesk-team",
      ownerId: siskaId,
    })
    .onConflictDoNothing();

  console.log("✅ Workspace seeded");

  // =========================================
  // WORKSPACE MEMBERS
  // =========================================

  await db
    .insert(workspaceMembers)
    .values([
      {
        id: "00000000-0000-0000-0000-000000000301",
        workspaceId,
        userId: siskaId,
        role: "OWNER",
      },
      {
        id: "00000000-0000-0000-0000-000000000302",
        workspaceId,
        userId: argaId,
        role: "ADMIN",
      },
      {
        id: "00000000-0000-0000-0000-000000000303",
        workspaceId,
        userId: nayaId,
        role: "MEMBER",
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Workspace members seeded");

  // =========================================
  // PROJECTS
  // =========================================

  await db
    .insert(projects)
    .values([
      {
        id: websiteProjectId,
        workspaceId,
        name: "Website Redesign",
        description:
          "Redesign the FlowDesk marketing website with a modern and responsive interface.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: new Date("2026-09-01"),
        dueDate: new Date("2026-10-15"),
      },
      {
        id: mobileProjectId,
        workspaceId,
        name: "Mobile App",
        description:
          "Build the first mobile experience for FlowDesk team members.",
        status: "PLANNING",
        priority: "MEDIUM",
        startDate: new Date("2026-10-01"),
        dueDate: new Date("2026-11-30"),
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Projects seeded");

  // =========================================
  // TASKS
  // =========================================

  await db
    .insert(tasks)
    .values([
      {
        id: "00000000-0000-0000-0000-000000000401",
        projectId: websiteProjectId,
        assigneeId: siskaId,
        title: "Set up authentication flow",
        description:
          "Implement registration, login, logout, and protected routes.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date("2026-09-28"),
        position: 0,
      },
      {
        id: "00000000-0000-0000-0000-000000000402",
        projectId: websiteProjectId,
        assigneeId: argaId,
        title: "Design database schema",
        description:
          "Finalize relational database structure and relationships.",
        status: "DONE",
        priority: "HIGH",
        dueDate: new Date("2026-09-10"),
        position: 1,
      },
      {
        id: "00000000-0000-0000-0000-000000000403",
        projectId: websiteProjectId,
        assigneeId: nayaId,
        title: "Create dashboard UI",
        description:
          "Build the main dashboard interface and reusable UI components.",
        status: "IN_REVIEW",
        priority: "MEDIUM",
        dueDate: new Date("2026-09-30"),
        position: 2,
      },
      {
        id: "00000000-0000-0000-0000-000000000404",
        projectId: websiteProjectId,
        assigneeId: nayaId,
        title: "Implement responsive layout",
        description:
          "Make the application responsive across desktop, tablet, and mobile.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date("2026-10-05"),
        position: 3,
      },
      {
        id: "00000000-0000-0000-0000-000000000405",
        projectId: mobileProjectId,
        assigneeId: argaId,
        title: "Define mobile architecture",
        description:
          "Decide application structure, navigation, and API integration strategy.",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date("2026-10-10"),
        position: 0,
      },
      {
        id: "00000000-0000-0000-0000-000000000406",
        projectId: mobileProjectId,
        assigneeId: siskaId,
        title: "Prepare mobile wireframes",
        description:
          "Create initial wireframes for the main mobile application screens.",
        status: "TODO",
        priority: "LOW",
        dueDate: new Date("2026-10-15"),
        position: 1,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Tasks seeded");

  console.log("🎉 Database seed completed successfully!");
};

seed()
  .catch((error) => {
    console.error("❌ Database seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });