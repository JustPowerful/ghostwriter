"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
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
      const workspace = await db.workspace.create({
        data: {
          title: title,
          email: email,
          ccEmails: ccEmails,
        },
      });
      return {
        success: true,
        message: "Workspace created successfully",
        workspace,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating workspace",
      };
    }
  });
