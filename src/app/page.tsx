import { auth } from "@/lib/auth/auth";
import LoginForm from "../components/auth/login-form";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <div></div>;
}
