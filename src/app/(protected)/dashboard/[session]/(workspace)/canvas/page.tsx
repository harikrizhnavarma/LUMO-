import React from "react";
import { ProjectProvider } from "@/components/projects/provider";
import { ProjectQuery } from "@/convex/query.config";
import { CanvasWorkspace } from "@/components/canvas/workspace";
import { LumoShell } from "@/components/lumo-studios/lumo-shell";

export const dynamic = "force-dynamic";

interface CanvasPageProps {
  searchParams: Promise<{ project?: string }>;
}

const CanvasPage = async ({ searchParams }: CanvasPageProps) => {
  const params = await searchParams;
  const projectId = params.project;

  if (!projectId) {
    return (
      <LumoShell>
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-muted-foreground">No project selected</p>
        </div>
      </LumoShell>
    );
  }

  const { project, profile } = await ProjectQuery(projectId);

  if (!profile) {
    return (
      <LumoShell>
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Authentication required</p>
        </div>
      </LumoShell>
    );
  }

  if (!project) {
    return (
      <LumoShell>
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-red-500">Project not found or access denied</p>
        </div>
      </LumoShell>
    );
  }

  return (
    <LumoShell>
      <ProjectProvider initialProject={project}>
        <div className="flex flex-col h-screen">
          <div className="flex-1 min-h-0">
            <CanvasWorkspace />
          </div>
        </div>
      </ProjectProvider>
    </LumoShell>
  );
};

export default CanvasPage;
