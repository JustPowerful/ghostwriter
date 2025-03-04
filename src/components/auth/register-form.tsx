"use client";
import Image from "next/image";
import { useState } from "react";
import ghostwriter from "@/assets/ghostwriter.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { registerAction } from "@/actions/auth/register-action";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Added import

const RegisterForm = () => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Added state
  const router = useRouter();
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-md shadow-md box-border">
      <Image
        src={ghostwriter}
        width={150}
        height={150}
        alt="a chibi logo of ghostrider writing on paper"
      />
      <h2 className="text-3xl font-bold text-center"> Register </h2>
      <p className="mb-4 text-center">Create your ghostwriter account 🔥💀</p>
      <form
        action={async (formData) => {
          setIsLoading(true); // Start loading
          try {
            const response = await registerAction({
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              confirmPassword: formData.get("confirmPassword") as string,
            });
            if (response) {
              if (response.validationErrors) {
                // convert the object of validationErrors into an array of strings
                const errors = Object.values(response.validationErrors).flatMap(
                  (error) => {
                    if (typeof error === "string") return [error];
                    if (Array.isArray(error)) return error;
                    return error._errors ?? [];
                  }
                );
                setErrorMessages(errors);
                return;
              }
              if (!response.data!.success) {
                setErrorMessages((prev) => [...prev, response.data!.message]);
                return;
              }
              router.push("/login");
            }
          } finally {
            setIsLoading(false); // End loading
          }
        }}
        className="w-full flex flex-col gap-4"
      >
        <div>
          {errorMessages.length > 0 &&
            errorMessages.map((message) => (
              <div className="text-red-500 text-center py-2">{message}</div>
            ))}
          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              placeholder="Email"
              className="w-full"
              name="email"
            />{" "}
          </div>
        </div>
        <div>
          <Label className="mb-2">Password</Label>
          <Input
            type="password"
            placeholder="Password"
            className="w-full"
            name="password"
          />
        </div>
        <div>
          <Label className="mb-2">Confirm Password</Label>
          <Input
            type="password"
            placeholder="Confirm Password"
            className="w-full"
            name="confirmPassword"
          />
        </div>
        <div>
          You already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login.
          </Link>
        </div>
        <Button className="w-full cursor-pointer">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;
