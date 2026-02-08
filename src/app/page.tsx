"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

import { LumoShell } from "@/components/lumo-studios/lumo-shell";
import { LumoLanding } from "@/components/lumo-studios/lumo-landing";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <LumoShell>
      <LumoLanding />
    </LumoShell>
  );
};

export default Page;
