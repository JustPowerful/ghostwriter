"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/lib/prisma/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { error } from "console";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    firstname: z.string().min(2),
    lastname: z.string().min(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { email, password, firstname, lastname } }) => {
    try {
      console.log(email, password, firstname, lastname);
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.create({
        data: {
          email,
          password: hashedPassword,
          firstname,
          lastname,
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
    throw error;
  });
