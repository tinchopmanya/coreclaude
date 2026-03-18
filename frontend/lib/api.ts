const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${backendUrl}/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`health request failed: ${response.status}`);
  }
  return (await response.json()) as { status: string };
}
