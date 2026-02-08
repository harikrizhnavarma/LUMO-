import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getStudioProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("studio_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile ?? null;
  },
});

export const upsertStudioProfile = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    title: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    privacy: v.optional(v.string()),
    syncMode: v.optional(v.string()),
    color: v.optional(v.string()),
    customHex: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("studio_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return { ok: true, profileId: existing._id };
    }

    const profileId = await ctx.db.insert("studio_profiles", {
      userId,
      ...args,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });

    return { ok: true, profileId };
  },
});
