"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/lib/prisma/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      return {
        success: true,
        message: "User created",
      };
    } catch (error) {
      // Handling Prisma Errors separately
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint error for the email
        if (error.code === "P2002") {
          return {
            success: false,
            message: "Email already exists",
          };
        }
      }
    }
  });
