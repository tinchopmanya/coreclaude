"use client";

import { useEffect, useState } from "react";

import ErrorState from "@/components/states/ErrorState";
import LoadingState from "@/components/states/LoadingState";
import PageContainer from "@/components/shell/PageContainer";
import { getProject, type Project } from "@/lib/projectClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ProjectDetailPage({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params
      .then(async ({ id }) => {
        const payload = await getProject(Number(id));
        setProject(payload);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "unable to load project"));
  }, [params]);

  if (error) {
    return <ErrorState title="Project detail error" message={error} />;
  }

  if (!project) {
    return <LoadingState message="Loading project..." />;
  }

  return (
    <PageContainer title="Project detail" subtitle="Example module detail page">
      <p>ID: {project.id}</p>
      <p>Name: {project.name}</p>
      <p>Description: {project.description}</p>
      <p>Owner: {project.owner_username}</p>
      <p>Created: {project.created_at}</p>
    </PageContainer>
  );
}
