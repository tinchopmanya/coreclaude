const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

type ApiResponse<T> = { data: T | null; error: { code: string; message: string } | null };

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${backendUrl}/health`, { cache: "no-store" });
  const payload = (await response.json()) as ApiResponse<{ status: string }>;

  if (!response.ok || payload.data === null) {
    throw new Error(payload.error?.message ?? `health request failed: ${response.status}`);
  }
  return payload.data;
}
