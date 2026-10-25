"use server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
  email: z.string().email(),
  role: z.enum(["viewer", "editor", "commenter", "admin"]).default("viewer"),
});

export const addMemberAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId, email, role } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) return { success: false, message: "You are not logged in" };
      const isWorkspaceOwner = await db.workspace.findUnique({
        where: { id: workspaceId, userId: session.user.id },
      });
      const isWorkspaceAdmin = await db.member.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
          role: "admin",
        },
      });
      if (!isWorkspaceOwner && !isWorkspaceAdmin)
        return {
          success: false,
          message: "You are not the owner or admin of this workspace",
        };

      // check if the user is adding themselves
      if (session.user.email === email) {
        return { success: false, message: "You cannot add yourself" };
      }
      const user = await db.user.findUnique({
        where: { email: email },
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
          role: role,
        },
      });
      revalidatePath("/workspace/*");
      return { success: true, message: "Member added", member };
    } catch {
      return { success: false, message: "Something went wrong" };
    }
  });
