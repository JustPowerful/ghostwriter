"use client";
import Image from "next/image";
import React, { useState } from "react";
import ghostwriter from "@/assets/ghostwriter.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-md shadow-md box-border">
      <Image
        src={ghostwriter}
        width={150}
        height={150}
        alt="a chibi logo of ghostrider writing on paper"
      />
      <h2 className="text-3xl font-bold text-center"> Login </h2>
      <p className="mb-4 text-center">Login and start ghostwriting 💀✨👍</p>
      {error && <p className="text-red-500">{error}</p>}
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            setIsLoading(true);
            const response = await signIn("credentials", {
              email: formData.email,
              password: formData.password,
              redirect: false,
            });
            if (response?.error) {
              setError("Wrong password or email");
            } else {
              window.location.href = "/dashboard";
            }
          } catch (error) {
            console.log(error);
            setError("Something went wrong");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <div>
          <div>
            <Label className="mb-2">Email</Label>
            <Input
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, email: event.target.value }))
              }
              type="email"
              placeholder="Email"
              className="w-full"
            />{" "}
          </div>
        </div>
        <div>
          <Label className="mb-2">Password</Label>
          <Input
            type="password"
            placeholder="Password"
            className="w-full"
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
          />
        </div>
        <div>
          You don't have an account?{" "}
          <Link href="/register" className="text-blue-500">
            Register.
          </Link>
        </div>
        <Button className="w-full cursor-pointer">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
