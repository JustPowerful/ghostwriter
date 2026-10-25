"use server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().nonempty(),
  email: z.string().email(),
  ccEmails: z
    .array(z.string())
    .optional()
    .transform(
      (arr) =>
        arr?.filter(
          (email) => email && z.string().email().safeParse(email).success,
        ) || [],
    ),
  receiverName: z.string().nonempty(),
});

export const createWorkspaceAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { title, email, ccEmails, receiverName } }) => {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
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
          receiverName: receiverName,
        },
      });
      revalidatePath("/dashboard");
      return {
        success: true,
        message: "Workspace created successfully",
        workspace,
      };
    } catch {
      return {
        success: false,
        message: "Error creating workspace",
      };
    }
  });
