import { db } from "@/db";
import { activities, activityTypeEnum } from "@/db/schema";

type CreateActivityInput = {
  workspaceId: string;
  userId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  type: (typeof activityTypeEnum.enumValues)[number];
  description: string;
};

export async function createActivity(
  input: CreateActivityInput,
) {
  await db.insert(activities).values({
    workspaceId: input.workspaceId,
    userId: input.userId ?? null,
    projectId: input.projectId ?? null,
    taskId: input.taskId ?? null,
    type: input.type,
    description: input.description,
  });
}