"use server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
  memberId: z.string().nonempty(),
  role: z.enum(["viewer", "editor", "commenter", "admin"]),
});

export const changeMemberRoleAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId, memberId, role } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) return { success: false, message: "You are not logged in" };

      // Check if the user is the workspace owner
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId, userId: session.user.id },
      });

      if (!workspace)
        return {
          success: false,
          message: "Workspace not found or unauthorized",
        };

      const member = await db.member.findFirst({
        where: {
          id: memberId,
          workspaceId,
        },
      });

      if (!member) {
        return {
          success: false,
          message: "Member not found in this workspace",
        };
      }

      // Update the member's role
      const updatedMember = await db.member.update({
        where: { id: memberId },
        data: { role },
      });

      revalidatePath("/workspace/*");
      return {
        success: true,
        message: "Member role updated",
        member: updatedMember,
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    }
  });
