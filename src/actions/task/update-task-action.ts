"use server";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

const schema = z.object({
  taskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const updateTaskAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { taskId, title, description } }) => {
    try {
      const session = await auth();
      if (!session) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }

      const task = await db.tasks.findUnique({
        where: {
          id: taskId,
        },
      });
      if (!task) {
        return {
          success: false,
          message: "Task not found",
        };
      }
      const workspaceId = task.workspaceId;
      const workspace = await db.workspace.findUnique({
        where: {
          id: workspaceId,
          userId: session.user.id,
        },
      });
      // if the user is not the owner of the workspace and the task
      if (!workspace) {
        return {
          success: false,
          message: "Workspace not found",
        };
      }
      await db.tasks.update({
        where: {
          id: taskId,
        },
        data: {
          title,
          description,
        },
      });
      revalidatePath("/workspace/*");
      return {
        success: true,
        message: "Successfully updated the task",
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred while updating the task",
      };
    }
  });
