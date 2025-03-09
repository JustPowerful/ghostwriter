"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({
  taskId: z.string(),
  assigneeId: z.string(),
});

export const removeAssigneeAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { taskId, assigneeId } }) => {
    try {
      const task = await db.tasks.findUnique({ where: { id: taskId } });
      if (!task) return { success: false, message: "Task not found" };
      const workspace = await db.workspace.findUnique({
        where: { id: task.workspaceId },
      });
      if (!workspace) return { success: false, message: "Workspace not found" };
      const session = await auth();
      if (!session) return { success: false, message: "Unauthorized" };
      // check if the user is a member  or the owner of the workspace
      const isMember = await db.member.findFirst({
        where: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      });
      const isOwner = workspace.userId === session.user.id;
      if (!isMember && !isOwner)
        return { success: false, message: "Unauthorized" };
      // Create the assignee
      await db.assignee.deleteMany({
        where: {
          taskId: taskId,
          userId: assigneeId,
        },
      });
      revalidatePath("/workspace/*");
      return { success: true, message: "Assignee removed" };
    } catch (error) {
      return { success: false, message: "There was a problem" };
    }
  });
