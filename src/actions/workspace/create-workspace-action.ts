"use server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  title: z.string().nonempty(),
  email: z.string().email(),
  ccEmails: z.array(z.string().email()).optional(),
});

export const createWorkspaceAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { title, email, ccEmails } }) => {
    try {
      const session = await auth();
      if (!session) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }
      const workspace = await db.workspace.create({
        data: {
          title: title,
          email: email,
          ccEmails: ccEmails,
          userId: session.user.id!,
        },
      });
      revalidatePath("/dashboard");
      return {
        success: true,
        message: "Workspace created successfully",
        workspace,
      };
    } catch (error) {
      throw error;
      return {
        success: false,
        message: "Error creating workspace",
      };
    }
  });
