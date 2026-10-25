"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  commentId: z.string().nonempty(),
});

export const deleteCommentAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { commentId } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return { success: false, message: "User not authenticated" };
      }

      const userId = session.user.id;

      // Check if comment exists
      const comment = await db.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return { success: false, message: "Comment not found" };
      }

      // Allow deletion if user owns the comment
      if (userId === comment.userId) {
        await db.comment.delete({
          where: { id: commentId },
        });
        revalidatePath("/workspace/*");
        return { success: true, message: "Comment deleted" };
      }

      // Check if user is admin of the workspace that this comment's task belongs to
      const task = await db.tasks.findUnique({
        where: { id: comment.taskId },
        select: { workspaceId: true },
      });

      if (!task) {
        return { success: false, message: "Task not found" };
      }

      const isWorkspaceOwner = await db.workspace.findUnique({
        where: { id: task.workspaceId, userId },
        select: { id: true },
      });

      const isAdminMember = await db.member.findFirst({
        where: { workspaceId: task.workspaceId, userId, role: "admin" },
        select: { id: true },
      });

      if (!isWorkspaceOwner && !isAdminMember) {
        return { success: false, message: "Unauthorized to delete this comment" };
      }

      await db.comment.delete({
        where: { id: commentId },
      });

      revalidatePath("/workspace/*");
      return { success: true, message: "Comment deleted" };
    } catch {
      return { success: false, message: "An error occurred while deleting the comment" };
    }
  });