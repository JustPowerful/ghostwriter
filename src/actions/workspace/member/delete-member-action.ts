"use server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
  userId: z.string().nonempty(),
});

export const deleteMemberAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId, userId } }) => {
    try {
      const session = await auth();
      if (!session) return { success: false, message: "Unauthorized" };
      const workspace = await db.workspace.findFirst({
        where: { id: workspaceId, userId: session.user.id },
      });
      if (!workspace) return { success: false, message: "Workspace not found" };
      const member = await db.member.findFirst({
        where: { workspaceId, userId },
      });
      if (!member) return { success: false, message: "Member not found" };
      await db.member.delete({ where: { id: member.id } });
      revalidatePath("/workspace/*");
      return { success: true, message: "Member deleted" };
    } catch (error) {
      return { success: false, message: "Something went wrong" };
    }
  });
