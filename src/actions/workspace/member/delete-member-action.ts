"use server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
  userId: z.string().nonempty(),
});

export const deleteMemberAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId, userId } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) return { success: false, message: "Unauthorized" };
      const isWorkspaceOwner = await db.workspace.findFirst({
        where: { id: workspaceId, userId: session!.user.id! },
      });
      const isWorkspaceAdmin = await db.member.findFirst({
        where: {
          workspaceId,
          userId: session!.user.id!,
          role: "admin",
        },
      });
      if (!isWorkspaceOwner && !isWorkspaceAdmin)
        return {
          success: false,
          message: "You are not the owner or admin of this workspace",
        };

      // check if the admin is removing themselves
      if (session!.user.id === userId) {
        return { success: false, message: "You cannot remove yourself" };
      }
      const member = await db.member.findFirst({
        where: { workspaceId, userId },
      });
      if (!member) return { success: false, message: "Member not found" };
      await db.member.delete({ where: { id: member.id } });
      revalidatePath("/workspace/*");
      return { success: true, message: "Member deleted" };
    } catch {
      return { success: false, message: "Something went wrong" };
    }
  });
