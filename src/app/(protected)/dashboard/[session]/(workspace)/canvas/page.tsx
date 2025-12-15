import React from "react";
import { ProjectProvider } from "@/components/projects/provider";
import { ProjectQuery } from "@/convex/query.config";
import { InfiniteCanvas } from "@/components/canvas";
import { BrandInfluenceControl } from "@/components/brand/brand-influence-control";

export const dynamic = "force-dynamic";

interface CanvasPageProps {
  searchParams: Promise<{ project?: string }>;
}

const CanvasPage = async ({ searchParams }: CanvasPageProps) => {
  const params = await searchParams;
  const projectId = params.project;

  if (!projectId) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  const { project, profile } = await ProjectQuery(projectId);

  if (!profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-red-500">Project not found or access denied</p>
      </div>
    );
  }

  return (
    <ProjectProvider initialProject={project}>
      <div className="flex flex-col h-screen">
        {/* Push the Brand Influence bar below the top navbar */}
        <div className="mt-24">
          <BrandInfluenceControl />
        </div>

        <div className="flex-1 min-h-0">
          <InfiniteCanvas />
        </div>
      </div>
    </ProjectProvider>
  );
};

export default CanvasPage;
