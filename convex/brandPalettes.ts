/* BrandKit V2 – Brand Palettes (Style Training & Learning) */

import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const paletteTypeValidator = v.union(
  v.literal("studio_pristine"),
  v.literal("studio_dramatic"),
  v.literal("environment_urban"),
  v.literal("environment_track"),
  v.literal("clay_development"),
  v.literal("technical_cutaway"),
  v.literal("custom")
);

export const getBrandPalettes = query({
  args: {
    brandId: v.optional(v.id("brands")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { brandId, projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let q = ctx.db.query("brand_palettes").withIndex("by_userId", (q) =>
      q.eq("userId", userId)
    );

    if (brandId) {
      q = ctx.db
        .query("brand_palettes")
        .withIndex("by_brandId", (q) => q.eq("brandId", brandId));
    } else if (projectId) {
      q = ctx.db
        .query("brand_palettes")
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId));
    }

    const palettes = await q.order("desc").collect();
    return palettes;
  },
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const savePalette = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    projectId: v.optional(v.id("projects")),
    paletteId: v.optional(v.id("brand_palettes")),
    name: v.string(),
    type: paletteTypeValidator,
    description: v.optional(v.string()),
    strictness: v.number(), // 0–100
    swatches: v.array(
      v.object({
        name: v.string(),
        hexColor: v.string(),
        role: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
    trainingConfig: v.optional(v.any()),
  },
  handler: async (
    ctx,
    { brandId, projectId, paletteId, name, type, description, strictness, swatches, trainingConfig }
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const slug = slugify(name);

    if (brandId) {
      const brand = await ctx.db.get(brandId);
      if (!brand || brand.userId !== userId) {
        throw new Error("Brand not found or access denied");
      }
    }

    if (projectId) {
      const project = await ctx.db.get(projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Project not found or access denied");
      }
    }

    // If updating existing palette
    if (paletteId) {
      const existing = await ctx.db.get(paletteId);
      if (!existing || existing.userId !== userId) {
        throw new Error("Palette not found or access denied");
      }

      await ctx.db.patch(paletteId, {
        name,
        slug,
        type,
        description,
        strictness,
        swatches,
        trainingConfig,
        updatedAt: now,
      });

      return { paletteId };
    }

    // If inserting first palette for this brand, mark as default
    let isDefault = false;
    if (brandId) {
      const existingForBrand = await ctx.db
        .query("brand_palettes")
        .withIndex("by_brandId", (q) => q.eq("brandId", brandId))
        .first();
      if (!existingForBrand) {
        isDefault = true;
      }
    }

    const newId = await ctx.db.insert("brand_palettes", {
      userId,
      brandId: brandId ?? undefined,
      projectId: projectId ?? undefined,
      name,
      slug,
      type,
      description,
      strictness,
      isDefault,
      swatches,
      trainingConfig,
      usageStats: {
        timesUsed: 0,
      },
      createdAt: now,
      updatedAt: now,
    });

    return { paletteId: newId };
  },
});

export const setDefaultPalette = mutation({
  args: {
    paletteId: v.id("brand_palettes"),
  },
  handler: async (ctx, { paletteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const palette = await ctx.db.get(paletteId);
    if (!palette || palette.userId !== userId) {
      throw new Error("Palette not found or access denied");
    }

    const { brandId } = palette;
    if (!brandId) {
      throw new Error("Only brand-scoped palettes can be default");
    }

    // Clear previous default
    const existingDefaults = await ctx.db
      .query("brand_palettes")
      .withIndex("by_brandId_isDefault", (q) =>
        q.eq("brandId", brandId).eq("isDefault", true)
      )
      .collect();

    await Promise.all(
      existingDefaults.map((p) =>
        ctx.db.patch(p._id, { isDefault: false, updatedAt: Date.now() })
      )
    );

    await ctx.db.patch(paletteId, {
      isDefault: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deletePalette = mutation({
  args: { paletteId: v.id("brand_palettes") },
  handler: async (ctx, { paletteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const palette = await ctx.db.get(paletteId);
    if (!palette || palette.userId !== userId) {
      throw new Error("Palette not found or access denied");
    }

    await ctx.db.delete(paletteId);
    return { success: true };
  },
});
