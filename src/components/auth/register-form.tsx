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
import { Loader2 } from "lucide-react";

const RegisterForm = () => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <Image
              src={ghostwriter}
              width={100}
              height={100}
              alt="Ghostwriter logo"
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
            <p className="mt-2 text-slate-500">Start ghostwriting with your own workspace</p>
          </div>

          {errorMessages.length > 0 && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <ul className="space-y-1">
                {errorMessages.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <form
            action={async (formData) => {
              setIsLoading(true);
              try {
                const response = await registerAction({
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  confirmPassword: formData.get("confirmPassword") as string,
                  firstname: formData.get("firstname") as string,
                  lastname: formData.get("lastname") as string,
                });

                if (response?.data?.success) {
                  router.push("/login");
                } else {
                  setErrorMessages([response?.data?.message || "Something went wrong"]);
                }
              } finally {
                setIsLoading(false);
              }
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First name
                </Label>
                <Input
                  type="text"
                  placeholder="John"
                  className="w-full"
                  name="firstname"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last name
                </Label>
                <Input
                  type="text"
                  placeholder="Doe"
                  className="w-full"
                  name="lastname"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="w-full"
                name="email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="w-full"
                name="password"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="w-full"
                name="confirmPassword"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-slate-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;