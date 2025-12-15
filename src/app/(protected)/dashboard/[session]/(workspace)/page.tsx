import {
  SubscriptionEntitlementQuery,
  ProjectsQuery,
  BrandsQuery,
} from "@/convex/query.config";
import { ProjectsProvider } from "@/components/projects/list/provider";
import { ProjectsList } from "@/components/projects/list";

export const dynamic = "force-dynamic";


interface WorkspacePageProps {
  // Next 15 dynamic routes: params is a Promise
  params: Promise<{ session: string }>;
}

const WorkspacePage = async ({ params }: WorkspacePageProps) => {
  // Await params before using it
  await params;

  const [
    { entitlement, profileName },
    { projects },
    { brands },
  ] = await Promise.all([
    SubscriptionEntitlementQuery(),
    ProjectsQuery(),
    BrandsQuery(),
  ]);

  const hasPaidPlan = Boolean(entitlement._valueJSON);
  const planLabel = hasPaidPlan ? "Pro plan" : "Free plan";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-6 pt-28">
      {/* Header with plan + credits */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            {profileName ? `Welcome back, ${profileName}` : "Welcome to LUMO"}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm">
            <span className="font-medium">{planLabel}</span>
          </div>
        </div>
      </header>

      {/* Projects section */}
      <section className="rounded-2xl
                          border border-neutral-300 dark:border-white/10
                          bg-neutral-100/80 dark:bg-black/40
                          backdrop-blur-xl shadow-sm
                          p-6">
        <ProjectsProvider initialProjects={projects} initialBrands={brands}>
          <ProjectsList />
        </ProjectsProvider>
      </section>
    </main>
  );
};

export default WorkspacePage;
