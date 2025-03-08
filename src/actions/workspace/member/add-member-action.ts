"use server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
  email: z.string().email(),
});

export const addMemberAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId, email } }) => {
    try {
      const session = await auth();
      if (!session) return { success: false, message: "You are not logged in" };
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId, userId: session.user.id },
      });
      if (!workspace) return { success: false, message: "Workspace not found" };
      const user = await db.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) return { success: false, message: "User not found" };

      // check if the user is already a member
      const memberExists = await db.member.findFirst({
        where: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      });
      if (memberExists)
        return { success: false, message: "User is already a member" };

      const member = await db.member.create({
        data: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      });
      revalidatePath("/workspace/*");
      return { success: true, message: "Member added", member };
    } catch (error) {
      return { success: false, message: "Something went wrong" };
    }
  });
