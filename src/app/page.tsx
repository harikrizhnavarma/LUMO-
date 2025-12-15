import { SubscriptionEntitlementQuery } from "@/convex/query.config";
import { redirect } from "next/navigation";
import { combinedSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Page = async () => {
  const { profileName } = await SubscriptionEntitlementQuery();

  // If we somehow don't have a profile yet, go to sign-in
  if (!profileName) {
    redirect("/auth/sign-in");
  }

  // For development: ALWAYS go to dashboard, even without a subscription
  redirect(`/dashboard/${combinedSlug(profileName!)}`);
};

export default Page;
