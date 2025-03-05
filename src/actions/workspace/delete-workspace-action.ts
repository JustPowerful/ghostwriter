"use server";
import { db } from "@/lib/prisma/db";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({
  workspaceId: z.string().nonempty(),
});

export const deleteWorkspaceAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { workspaceId } }) => {
    try {
      const session = await auth();
      const workspace = await db.workspace.findUnique({
        where: {
          id: workspaceId,
          userId: session!.user.id!,
        },
      });
      if (!workspace) {
        throw new Error("Workspace not found");
      }
      await db.workspace.delete({
        where: { id: workspaceId },
      });
      revalidatePath("/dashboard");
      return {
        success: true,
        message: "Workspace deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "There was an error deleting the workspace",
      };
    }
  });
