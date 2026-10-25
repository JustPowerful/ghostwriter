"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  taskId: z.string().nonempty(),
  content: z.string().nonempty(),
});

export const addCommentAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { taskId, content } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return { success: false, message: "User not authenticated" };
      }

      const user = session.user;

      // Create the comment
      const comment = await db.comment.create({
        data: {
          content,
          taskId,
          userId: user.id,
        },
      });

      revalidatePath("/workspace/*");
      return { success: true, message: "Comment added", comment };
    } catch {
      return { success: false, message: "An error occurred while adding the comment" };
    }
  });