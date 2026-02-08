import { ProjectsQuery } from "@/convex/query.config";
import { LumoShell } from "@/components/lumo-studios/lumo-shell";
import { LumoDashboard } from "@/components/lumo-studios/lumo-dashboard";

export const dynamic = "force-dynamic";


interface WorkspacePageProps {
  // Next 15 dynamic routes: params is a Promise
  params: Promise<{ session: string }>;
}

const WorkspacePage = async ({ params }: WorkspacePageProps) => {
  // Await params before using it
  await params;

  const [{ projects, profile }] = await Promise.all([ProjectsQuery()]);
  const projectsData =
    (projects as { _valueJSON?: unknown })?._valueJSON ?? [];

  return (
    <LumoShell>
      <LumoDashboard projects={projectsData as any[]} profile={profile ?? null} />
    </LumoShell>
  );
};

export default WorkspacePage;
