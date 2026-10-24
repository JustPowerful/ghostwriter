"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth/auth";

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
      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          firstname: firstname, // required by the auth service for user creation
          lastname: lastname, // required by the auth service for user creation
          name: `${firstname} ${lastname}`, // required initially for the auth service, but the auth service databaseHook will update the name field to be a concatenation of firstname and lastname
        },
      });
      if (!response.user) {
        return { success: false, message: "Registration failed" };
      }
      return { success: true, message: "User created" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Something went wrong" };
    }
  });
