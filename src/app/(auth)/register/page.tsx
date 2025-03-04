import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import React from "react";

const page = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <RegisterForm />
    </div>
  );
};

export default page;
