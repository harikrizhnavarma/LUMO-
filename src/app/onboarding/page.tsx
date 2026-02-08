"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { LumoShell } from "@/components/lumo-studios/lumo-shell";
import { LumoOnboarding, LumoProfile } from "@/components/lumo-studios/lumo-onboarding";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

const LOCAL_PROFILE_KEY = "lumo_core_profile";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const studioProfile = useQuery(api.studioProfiles.getStudioProfile);
  const upsertStudioProfile = useMutation(
    api.studioProfiles.upsertStudioProfile
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && studioProfile) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, studioProfile, router]);

  const handleComplete = async (profile: LumoProfile) => {
    try {
      await upsertStudioProfile({
        name: profile.name,
        handle: profile.handle,
        title: profile.title,
        avatarUrl: profile.avatarUrl,
        privacy: profile.privacy,
        syncMode: profile.syncMode,
        color: profile.color,
        customHex: profile.customHex,
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      }
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save onboarding profile.");
    }
  };

  return (
    <LumoShell>
      <LumoOnboarding onComplete={handleComplete} />
    </LumoShell>
  );
};

export default Page;
