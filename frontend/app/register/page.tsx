"use client";

import { useRouter } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { register } from "@/lib/authClient";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Register"
      submitLabel="Register"
      onSubmit={async (username, password) => {
        await register({ username, password });
        router.push("/login");
      }}
    />
  );
}
