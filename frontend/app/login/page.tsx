"use client";

import { useRouter } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Login"
      submitLabel="Login"
      onSubmit={async (username, password) => {
        await login({ username, password });
        router.push("/dashboard");
      }}
    />
  );
}
