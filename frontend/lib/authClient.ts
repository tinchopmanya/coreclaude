const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

type Credentials = { username: string; password: string };
type ApiResponse<T> = { data: T | null; error: { code: string; message: string } | null };

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    credentials: "include"
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.data === null) {
    throw new Error(payload.error?.message ?? `request failed: ${response.status}`);
  }
  return payload.data;
}

export const register = (credentials: Credentials) => call<{ status: string }>("/auth/register", { method: "POST", body: JSON.stringify(credentials) });
export const login = (credentials: Credentials) => call<{ status: string }>("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const me = () => call<{ username: string }>("/auth/me", { method: "GET" });
export const logout = () => call<{ status: string }>("/auth/logout", { method: "POST" });
