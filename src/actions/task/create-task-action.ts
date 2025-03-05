"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";

const schema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional(),
  workspaceId: z.string().nonempty(),
});

export const createTaskAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { title, description, workspaceId } }) => {
    try {
      const session = await auth();
      if (!session) {
        return {
          success: false,
          message: "You are not authenticated",
        };
      }

      const workspace = await db.workspace.findFirst({
        where: {
          id: workspaceId,
          userId: session.user.id,
        },
      });

      if (!workspace) {
        return {
          success: false,
          message: "Workspace not found",
        };
      }

      await db.tasks.create({
        data: {
          title,
          workspaceId,
          description,
        },
      });

      revalidatePath("/workspace/*");
      return {
        success: true,
        message: "Task created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  });
