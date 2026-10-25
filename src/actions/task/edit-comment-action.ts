"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  commentId: z.string().nonempty(),
  content: z.string().nonempty(),
});

export const editCommentAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { commentId, content } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return { success: false, message: "User not authenticated" };
      }

      const user = session.user;

      // Check if comment exists and get ownership info
      const comment = await db.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return { success: false, message: "Comment not found" };
      }

      // Only the comment owner can edit
      if (user.id !== comment.userId) {
        return { success: false, message: "Unauthorized to edit this comment" };
      }

      const updatedComment = await db.comment.update({
        where: { id: commentId },
        data: { content },
      });

      revalidatePath("/workspace/*");
      return { success: true, message: "Comment updated", comment: updatedComment };
    } catch {
      return { success: false, message: "An error occurred while editing the comment" };
    }
  });