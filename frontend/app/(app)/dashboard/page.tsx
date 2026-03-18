"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EmptyState from "@/components/states/EmptyState";
import PageContainer from "@/components/shell/PageContainer";
import { createProject, deleteProject, listProjects, type Project } from "@/lib/projectClient";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("Welcome to your reusable SaaS starter dashboard.");

  async function refreshProjects() {
    const projectList = await listProjects();
    setProjects(projectList);
  }

  useEffect(() => {
    refreshProjects().catch((err) => setMessage(err instanceof Error ? err.message : "Unable to load projects"));
  }, []);

  return (
    <PageContainer title="Dashboard" subtitle="Reusable starter overview">
      <section className="card-grid">
        <article className="card">
          <h3>Welcome</h3>
          <p>Use this shell as your base for future MVP modules.</p>
        </article>
        <article className="card">
          <h3>Summary</h3>
          <p>Projects: {projects.length}</p>
        </article>
        <article className="card">
          <h3>Quick actions</h3>
          <p>Create your next MVP module from this pattern.</p>
        </article>
      </section>

      <section className="card">
        <h2>Create project</h2>
        <form
          className="inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await createProject(name, description);
              setName("");
              setDescription("");
              setMessage("Project created.");
              await refreshProjects();
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "create failed");
            }
          }}
        >
          <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Project module (example)</h2>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" message="Create your first project above." />
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
                <span>{project.owner_username}</span>
                <button
                  onClick={async () => {
                    await deleteProject(project.id);
                    await refreshProjects();
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Recent activity (placeholder)</h2>
        <p>{message}</p>
      </section>
    </PageContainer>
  );
}
