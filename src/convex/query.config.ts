import { fetchMutation, preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { Id } from "../../convex/_generated/dataModel";
import { ConvexUserRaw, normalizeProfile } from "@/types/user";

import type {
  BrandDNAProfile,
  BrandKitTier,
  BrandRulesEngineConfig,
  VisualTrainingLibraryStats,
  BrandPalette
} from "@/types/brandKit";

// When POLAR_ACCESS_TOKEN is empty, we treat billing as disabled
// and allow AI usage without checking credits.
const BILLING_ENABLED =
  !!process.env.POLAR_ACCESS_TOKEN &&
  process.env.POLAR_ACCESS_TOKEN.trim().length > 0;

export const ProfileQuery = async () => {
  return await preloadQuery(
    api.user.getCurrentUser,
    {},
    { token: await convexAuthNextjsToken() }
  );
};

export const SubscriptionEntitlementQuery = async () => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  // If no user yet, treat as no entitlement.
  if (!profile?.id) {
    return {
      entitlement: { _valueJSON: null } as any,
      profileName: null,
    };
  }

  // In dev with billing disabled, just pretend they are entitled
  if (!BILLING_ENABLED) {
    return {
      entitlement: { _valueJSON: true } as any,
      profileName: profile.name ?? profile.email ?? null,
    };
  }

  const entitlement = await preloadQuery(
    api.subscription.hasEntitlement,
    { userId: profile.id as Id<"users"> },
    { token: await convexAuthNextjsToken() }
  );

  return {
    entitlement,
    profileName: profile.name ?? profile.email ?? null,
  };
};

export const ProjectsQuery = async () => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  if (!profile?.id) {
    return { projects: null, profile: null };
  }

  const projects = await preloadQuery(
    api.projects.getUserProjects,
    { userId: profile.id as Id<"users"> },
    { token: await convexAuthNextjsToken() }
  );

  return { projects, profile };
};

export const ProjectQuery = async (projectId: string) => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  // Extra safety: treat "null"/"undefined" strings as no project
  if (
    !profile?.id ||
    !projectId ||
    projectId === "null" ||
    projectId === "undefined"
  ) {
    return { project: null, profile: null };
  }

  const project = await preloadQuery(
    api.projects.getProject,
    { projectId: projectId as Id<"projects"> },
    { token: await convexAuthNextjsToken() }
  );

  return { project, profile };
};

export const CreditsBalanceQuery = async () => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  // No logged-in user
  if (!profile?.id) {
    if (!BILLING_ENABLED) {
      // Dev mode, billing disabled: give effectively infinite balance
      return { ok: true, balance: 1_000_000, profile: null };
    }
    return { ok: false, balance: 0, profile: null };
  }

  // Logged-in user, but billing disabled (dev / testing):
  // just short-circuit with a large balance.
  if (!BILLING_ENABLED) {
    return { ok: true, balance: 1_000_000, profile };
  }

  const result = await preloadQuery(
    api.subscription.getCreditsBalance,
    { userId: profile.id as Id<"users"> },
    { token: await convexAuthNextjsToken() }
  );

  return {
    ok: true,
    // result._valueJSON is whatever the query returned (number | null)
    balance: (result as any)._valueJSON ?? 0,
    profile,
  };
};

export const ConsumeCreditsQuery = async ({
  amount,
  reason,
}: {
  amount?: number;
  reason?: string;
}) => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  // No logged-in user
  if (!profile?.id) {
    if (!BILLING_ENABLED) {
      // Dev mode, do nothing but still "succeed"
      return { ok: true, balance: 0, profile: null };
    }
    return { ok: false, balance: 0, profile: null };
  }

  // Billing disabled: no-op but succeed
  if (!BILLING_ENABLED) {
    return { ok: true, balance: 0, profile };
  }

  const res: any = await fetchMutation(
    api.subscription.consumeCredits,
    {
      userId: profile.id as Id<"users">,
      amount: amount ?? 1,
      reason: reason ?? "ai:generation",
    },
    { token: await convexAuthNextjsToken() }
  );

  return {
    ok: !!res.ok,
    balance: res.balance ?? 0,
    profile,
  };
};

export const StyleGuideQuery = async (projectId: string) => {
  const styleGuide = await preloadQuery(
    api.projects.getProjectStyleGuide,
    { projectId: projectId as Id<"projects"> },
    { token: await convexAuthNextjsToken() }
  );

  return { styleGuide };
};

export const MoodBoardImagesQuery = async (projectId: string) => {
  const images = await preloadQuery(
    api.moodboard.getMoodBoardImages,
    { projectId: projectId as Id<"projects"> },
    { token: await convexAuthNextjsToken() }
  );

  return { images };
};

export const InspirationImagesQuery = async (projectId: string) => {
  const images = await preloadQuery(
    api.inspiration.getInspirationImages,
    { projectId: projectId as Id<"projects"> },
    { token: await convexAuthNextjsToken() }
  );

  return { images };
};

export const BrandsQuery = async () => {
  const rawProfile = await ProfileQuery();
  const profile = normalizeProfile(
    rawProfile._valueJSON as unknown as ConvexUserRaw | null
  );

  if (!profile?.id) {
    return { brands: null, profile: null };
  }

  const brands = await preloadQuery(
    api.brands.getUserBrands,
    {},
    { token: await convexAuthNextjsToken() }
  );

  return { brands, profile };
};

export const AssignProjectToBrandMutation = async ({
  projectId,
  brandId,
}: {
  projectId: string;
  brandId?: string | null;
}) => {
  // Cookie-based auth, no manual token needed
  await fetchMutation(api.brands.assignProjectToBrand, {
    projectId: projectId as Id<"projects">,
    // If brandId is empty/null, clear the brand on the project
    brandId: brandId ? (brandId as Id<"brands">) : undefined,
  });
};

export const BrandKitQuery = async (brandId: string) => {
  const brandKit = await preloadQuery(
    api.brands.getBrandKit,
    { brandId: brandId as Id<"brands"> },
    { token: await convexAuthNextjsToken() }
  );

  return brandKit;
};

export const BrandPalettesQuery = async (args: {
  brandId?: string | null;
  projectId?: string | null;
}) => {
  const { brandId, projectId } = args;

  const palettes = await preloadQuery(
    api.brandPalettes.getBrandPalettes,
    {
      brandId: brandId ? (brandId as Id<"brands">) : undefined,
      projectId: projectId ? (projectId as Id<"projects">) : undefined,
    },
    { token: await convexAuthNextjsToken() }
  );

  return palettes;
};

export const SaveBrandPaletteMutation = async (args: {
  brandId?: string | null;
  projectId?: string | null;
  paletteId?: string;
  name: string;
  type: string;
  description?: string;
  strictness: number;
  swatches: BrandPalette["swatches"];
  trainingConfig?: BrandPalette["trainingConfig"];
}) => {
  const {
    brandId,
    projectId,
    paletteId,
    name,
    type,
    description,
    strictness,
    swatches,
    trainingConfig,
  } = args;

  await fetchMutation(api.brandPalettes.savePalette, {
    brandId: brandId ? (brandId as Id<"brands">) : undefined,
    projectId: projectId ? (projectId as Id<"projects">) : undefined,
    paletteId: paletteId as Id<"brand_palettes"> | undefined,
    name,
    type: type as any,
    description,
    strictness,
    swatches,
    trainingConfig,
  });
};

export const SetDefaultBrandPaletteMutation = async (paletteId: string) => {
  await fetchMutation(api.brandPalettes.setDefaultPalette, {
    paletteId: paletteId as Id<"brand_palettes">,
  });
};

export const DeleteBrandPaletteMutation = async (paletteId: string) => {
  await fetchMutation(api.brandPalettes.deletePalette, {
    paletteId: paletteId as Id<"brand_palettes">,
  });
};


export const UpsertBrandKitMutation = async ({
  brandId,
  tier,
  dnaProfile,
  trainingLibrary,
  rulesEngine,
  dashboardConfig,
  analyticsSummary,
}: {
  brandId: string;
  tier?: BrandKitTier;
  dnaProfile?: BrandDNAProfile;
  trainingLibrary?: VisualTrainingLibraryStats;
  rulesEngine?: BrandRulesEngineConfig;
  dashboardConfig?: any;
  analyticsSummary?: any;
}) => {
  await fetchMutation(api.brands.upsertBrandKit, {
    brandId: brandId as Id<"brands">,
    tier,
    dnaProfile,
    visualTrainingLibrary: trainingLibrary,
    rulesEngine,
    dashboardConfig,
    analyticsSummary,
  });
};

