/* BrandKit V2 - Brand entities, BrandKit profiles, and project-brand association */

import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const brandKitTierValidator = v.union(
  v.literal("personal"),
  v.literal("professional"),
  v.literal("enterprise"),
  v.literal("collaborative")
);

/**
 * Create a new brand for the current user.
 *
 * Brand-level data (style guide, moodboard, inspiration images) lives in the `brands` table,
 * and individual projects can optionally point to a brand via projects.brandId.
 *
 * We also create a BrandKit profile row with default DNA/rules/analytics slots.
 */
export const createBrand = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    tier: v.optional(brandKitTierValidator),
  },
  handler: async (ctx, { name, description, tier }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const brandId = await ctx.db.insert("brands", {
      userId,
      name,
      description,
      styleGuide: undefined,
      moodBoardImages: [],
      inspirationImages: [],
      createdAt: now,
      updatedAt: now,
    });

    const brandKitId = await ctx.db.insert("brand_kits", {
      userId,
      brandId,
      tier: tier ?? "personal",
      // Empty but structured placeholders matching src/types/brandKit.ts
      dnaProfile: null,
      visualTrainingLibrary: {
        totalImages: 0,
        byCategory: {},
        recommendedRanges: {
          minimum: 25,
          recommended: [60, 100],
          optimal: [150, 200],
        },
      },
      rulesEngine: {
        mandatory: {},
        guidance: {},
        context: {},
      },
      dashboardConfig: {
        // Thresholds for Brand Adherence score bands
        perfectMinScore: 90,
        strongMinScore: 80,
        moderateMinScore: 70,
        weakMinScore: 60,
      },
      analyticsSummary: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { brandId, brandKitId };
  },
});

/**
 * Return all brands owned by the current user.
 * (Just the raw brand documents; BrandKit details are loaded via getBrandKit / upsertBrandKit.)
 */
export const getUserBrands = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return brands;
  },
});

/**
 * Get a single brand by id, making sure it belongs to the current user.
 */
export const getBrand = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, { brandId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error("Brand not found");
    }

    return brand;
  },
});

/**
 * Update basic brand properties (name, description).
 * BrandKit-specific fields live in brand_kits and are updated via upsertBrandKit.
 */
export const updateBrand = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { brandId, name, description }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error("Brand not found or access denied");
    }

    const patch: any = {
      updatedAt: Date.now(),
    };

    if (typeof name === "string") {
      patch.name = name;
    }
    if (typeof description === "string") {
      patch.description = description;
    }

    await ctx.db.patch(brandId, patch);

    return { success: true };
  },
});

/**
 * Get BrandKit (DNA, rules, analytics) for a specific brand.
 */
export const getBrandKit = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, { brandId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error("Brand not found");
    }

    const [brandKit] = await ctx.db
      .query("brand_kits")
      .withIndex("by_brandId", (q) => q.eq("brandId", brandId))
      .collect();

    return {
      brand,
      brandKit: brandKit ?? null,
    };
  },
});

/**
 * Upsert the BrandKit profile for a brand.
 * Main entrypoint for saving Brand DNA, training library stats, and rules engine config.
 */
export const upsertBrandKit = mutation({
  args: {
    brandId: v.id("brands"),
    tier: v.optional(brandKitTierValidator),
    dnaProfile: v.optional(v.any()),
    visualTrainingLibrary: v.optional(v.any()),
    rulesEngine: v.optional(v.any()),
    dashboardConfig: v.optional(v.any()),
    analyticsSummary: v.optional(v.any()),
  },
  handler: async (
    ctx,
    {
      brandId,
      tier,
      dnaProfile,
      visualTrainingLibrary,
      rulesEngine,
      dashboardConfig,
      analyticsSummary,
    }
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(brandId);
    if (!brand || brand.userId !== userId) {
      throw new Error("Brand not found or access denied");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("brand_kits")
      .withIndex("by_brandId", (q) => q.eq("brandId", brandId))
      .first();

    if (!existing) {
      const brandKitId = await ctx.db.insert("brand_kits", {
        userId,
        brandId,
        tier: tier ?? "personal",
        dnaProfile: dnaProfile ?? null,
        visualTrainingLibrary:
          visualTrainingLibrary ?? {
            totalImages: 0,
            byCategory: {},
          },
        rulesEngine:
          rulesEngine ?? {
            mandatory: {},
            guidance: {},
            context: {},
          },
        dashboardConfig:
          dashboardConfig ?? {
            perfectMinScore: 90,
            strongMinScore: 80,
            moderateMinScore: 70,
            weakMinScore: 60,
          },
        analyticsSummary: analyticsSummary ?? null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      return { brandKitId };
    }

    const patch: any = {
      updatedAt: now,
    };

    if (tier) patch.tier = tier;
    if (dnaProfile !== undefined) patch.dnaProfile = dnaProfile;
    if (visualTrainingLibrary !== undefined) {
      patch.visualTrainingLibrary = visualTrainingLibrary;
    }
    if (rulesEngine !== undefined) patch.rulesEngine = rulesEngine;
    if (dashboardConfig !== undefined) patch.dashboardConfig = dashboardConfig;
    if (analyticsSummary !== undefined) {
      patch.analyticsSummary = analyticsSummary;
    }

    await ctx.db.patch(existing._id, patch);

    return { brandKitId: existing._id };
  },
});

/**
 * Attach or detach a project to a brand.
 */
export const assignProjectToBrand = mutation({
  args: {
    projectId: v.id("projects"),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, { projectId, brandId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    if (brandId) {
      const brand = await ctx.db.get(brandId);
      if (!brand || brand.userId !== userId) {
        throw new Error(
          "Cannot assign project to a brand you do not own or that does not exist"
        );
      }
    }

    await ctx.db.patch(projectId, {
      brandId: brandId ?? undefined,
      lastModified: Date.now(),
    });

    return { success: true };
  },
});
