const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

type Credentials = { username: string; password: string };

async function call(path: string, init: RequestInit): Promise<any> {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    credentials: "include"
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? `request failed: ${response.status}`);
  return payload;
}

export const register = (credentials: Credentials) => call("/auth/register", { method: "POST", body: JSON.stringify(credentials) });
export const login = (credentials: Credentials) => call("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const me = () => call("/auth/me", { method: "GET" });
export const logout = () => call("/auth/logout", { method: "POST" });
