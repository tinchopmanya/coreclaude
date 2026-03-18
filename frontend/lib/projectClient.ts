const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type Project = {
  id: number;
  name: string;
  description: string;
  owner_username: string;
  created_at: string;
};

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

export const createProject = (name: string, description: string) =>
  call<Project>("/projects", { method: "POST", body: JSON.stringify({ name, description }) });

export const listProjects = () => call<Project[]>("/projects", { method: "GET" });

export const getProject = (projectId: number) => call<Project>(`/projects/${projectId}`, { method: "GET" });

export const deleteProject = (projectId: number) => call<{ status: string }>(`/projects/${projectId}`, { method: "DELETE" });
