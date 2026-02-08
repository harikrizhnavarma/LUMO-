"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

import { LumoShell } from "@/components/lumo-studios/lumo-shell";
import { LumoOnboarding, LumoProfile } from "@/components/lumo-studios/lumo-onboarding";

const LOCAL_PROFILE_KEY = "lumo_core_profile";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleComplete = (profile: LumoProfile) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    }
    router.replace("/dashboard");
  };

  return (
    <LumoShell>
      <LumoOnboarding onComplete={handleComplete} />
    </LumoShell>
  );
};

export default Page;
