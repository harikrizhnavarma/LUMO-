// src/app/(protected)/dashboard/page.tsx
import { SubscriptionEntitlementQuery } from "@/convex/query.config";
import { redirect } from "next/navigation";
import { combinedSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const { profileName } = await SubscriptionEntitlementQuery();

  if (!profileName) {
    redirect("/auth/sign-in");
  }

  redirect(`/dashboard/${combinedSlug(profileName!)}`);
};

export default DashboardPage;
