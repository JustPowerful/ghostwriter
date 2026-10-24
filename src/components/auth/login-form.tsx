"use client";
import Image from "next/image";
import React, { useState } from "react";
import ghostwriter from "@/assets/ghostwriter.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-slate-500">Sign in to your Ghostwriter account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                setIsLoading(true);
                const response = await authClient.signIn.email({
                  email: formData.email,
                  password: formData.password,
                  callbackURL: "/dashboard",
                });
                if (response.error) {
                  setError("Wrong password or email");
                } else {
                  window.location.href = "/dashboard";
                }
              } catch (err) {
                console.log("The error is ", err);
                setError("Something went wrong");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="w-full"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
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
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, password: event.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-slate-900 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;