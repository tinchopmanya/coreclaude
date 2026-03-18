"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import EmptyState from "@/components/states/EmptyState";
import Card from "@/components/ui/Card";
import DataList from "@/components/ui/DataList";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <PageContainer
      title="Dashboard"
      subtitle="Reusable starter overview"
      actions={<button className="primary-btn">Upgrade</button>}
    >
      <section className="card-grid">
        <Card>
          <h3>Welcome</h3>
          <p>Use this shell as your base for future MVP modules.</p>
        </Card>
        <Card>
          <h3>Summary</h3>
          <p>Projects: {projects.length}</p>
        </Card>
        <Card>
          <h3>Quick actions</h3>
          <p>Create your next MVP module from this pattern.</p>
        </Card>
      </section>

      <Card>
        <SectionHeader title="Create project" description="Project module is intentionally an example module." />
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
          <button type="submit" className="primary-btn">
            Create
          </button>
        </form>
      </Card>

      <Card>
        <SectionHeader title="Project module (example)" description="Reusable CRUD pattern for future modules." />
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" message="Create your first project above." />
        ) : (
          <DataList>
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
                <span>{project.owner_username}</span>
                <button
                  className="secondary-btn"
                  onClick={async () => {
                    await deleteProject(project.id);
                    await refreshProjects();
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </DataList>
        )}
      </Card>

      <Card>
        <SectionHeader title="Recent activity" description="Placeholder to be replaced by future module events." />
        <p>{message}</p>
      </Card>
    </PageContainer>
  );
}
