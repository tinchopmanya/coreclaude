"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout, me } from "@/lib/authClient";
import ErrorState from "@/components/states/ErrorState";
import LoadingState from "@/components/states/LoadingState";
import AppShell from "@/components/shell/AppShell";

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    me()
      .then((payload) => setUsername(payload.username as string))
      .catch((err) => setError(err instanceof Error ? err.message : "unauthorized"));
  }, []);

  if (error) {
    return (
      <main>
        <ErrorState title="Authentication required" message={error} />
        <p>
          <Link href="/login">Go to login</Link>
        </p>
      </main>
    );
  }

  if (!username) {
    return <LoadingState message="Loading authenticated shell..." />;
  }

  return (
    <AppShell
      username={username}
      onLogout={async () => {
        await logout();
        router.push("/login");
      }}
    >
      {children}
    </AppShell>
  );
}
