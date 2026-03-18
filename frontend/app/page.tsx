import Link from "next/link";

import { getHealth } from "@/lib/api";

export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1>Frontend</h1>
      <p>Backend health:</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
      <p>
        <Link href="/register">Register</Link> | <Link href="/login">Login</Link> | <Link href="/dashboard">Dashboard</Link>
      </p>
    </main>
  );
}
