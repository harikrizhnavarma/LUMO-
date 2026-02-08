import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Billing subscription records from Polar
  subscriptions: defineTable({
    userId: v.id("users"),
    polarCustomerId: v.string(),
    polarSubscriptionId: v.string(),
    productId: v.optional(v.string()),
    priceId: v.optional(v.string()),
    planCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    cancelAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    seats: v.optional(v.number()),
    metadata: v.optional(v.any()),
    creditsBalance: v.number(),
    creditsGrantPerPeriod: v.number(),
    creditsRolloverLimit: v.number(),
    lastGrantCursor: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_polarSubscriptionId", ["polarSubscriptionId"])
    .index("by_status", ["status"]),

  // Credit grant / consumption history
  credits_ledger: defineTable({
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    amount: v.number(),
    type: v.string(), // "grant" | "consume" | "adjust"
    reason: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  })
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_userId", ["userId"])
    .index("by_idempotencyKey", ["idempotencyKey"]),

  // Brands (core Brand entity)
  brands: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    styleGuide: v.optional(v.string()), // JSON string for brand-level style guide
    moodBoardImages: v.optional(v.array(v.string())), // Storage IDs or URLs
    inspirationImages: v.optional(v.array(v.string())), // Storage IDs or URLs
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // BrandKit core profile per brand (DNA, training, rules, analytics)
  brand_kits: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    tier: v.string(), // "personal" | "professional" | "enterprise" | "collaborative"

    // Typed on the frontend via src/types/brandKit.ts
    dnaProfile: v.optional(v.any()), // BrandDNAProfile
    visualTrainingLibrary: v.optional(v.any()), // VisualTrainingLibraryStats
    rulesEngine: v.optional(v.any()), // BrandRulesEngineConfig
    dashboardConfig: v.optional(v.any()), // thresholds, alert settings, etc.
    analyticsSummary: v.optional(v.any()), // BrandAnalyticsSummary

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_brandId", ["brandId"])
    .index("by_userId_brandId", ["userId", "brandId"]),

  // Individual training images for BrandKit
  brand_training_images: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    brandKitId: v.optional(v.id("brand_kits")),
    imageStorageId: v.string(), // Convex storage ID or external URL
    category: v.string(), // "hero_products" | "material_finish" | ...
    resolution: v.optional(
      v.object({
        width: v.number(),
        height: v.number(),
      })
    ),
    qualityScore: v.optional(v.number()), // 0–100
    sourceType: v.optional(v.string()), // "upload" | "generated" | "external"
    createdAt: v.number(),
  })
    .index("by_brandId", ["brandId"])
    .index("by_brandKitId", ["brandKitId"])
    .index("by_userId", ["userId"]),

  // Aggregated analytics snapshots for Brand Intelligence Dashboard
  brand_analytics_snapshots: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    brandKitId: v.optional(v.id("brand_kits")),
    period: v.string(), // e.g. "2025-12", "2025-Q4"
    metrics: v.any(), // BrandAnalyticsSummary or similar
    createdAt: v.number(),
  })
    .index("by_brandId_period", ["brandId", "period"])
    .index("by_brandKitId_period", ["brandKitId", "period"])
    .index("by_userId", ["userId"]),

  // Brand Palettes (Step 3 – Style Training & Learning)
  brand_palettes: defineTable({
    userId: v.id("users"),
    brandId: v.optional(v.id("brands")), // may be null for project-scoped palettes
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    slug: v.string(),
    type: v.string(), // BrandPaletteType
    description: v.optional(v.string()),
    strictness: v.number(), // 0–100
    isDefault: v.boolean(),
    swatches: v.array(
      v.object({
        name: v.string(),
        hexColor: v.string(),
        role: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
    trainingConfig: v.optional(v.any()), // BrandPaletteTrainingConfig
    usageStats: v.optional(v.any()), // BrandPaletteUsageStats
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brandId", ["brandId"])
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_brandId_isDefault", ["brandId", "isDefault"]),

  // Projects created inside the workspace
  projects: defineTable({
    userId: v.id("users"),
    brandId: v.optional(v.id("brands")), // optional brand association
    name: v.string(),
    description: v.optional(v.string()),
    styleGuide: v.optional(v.string()),
    sketchesData: v.any(), // JSON structure matching Redux shapes state
    viewportData: v.optional(v.any()), // JSON viewport (scale, translate)
    generatedDesignData: v.optional(v.any()), // JSON for generated UI components
    thumbnail: v.optional(v.string()),
    moodBoardImages: v.optional(v.array(v.string())),
    inspirationImages: v.optional(v.array(v.string())),
    lastModified: v.number(),
    createdAt: v.number(),
    isPublic: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    projectNumber: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_lastModified", ["userId", "lastModified"])
    .index("by_userId_projectNumber", ["userId", "projectNumber"])
    .index("by_public", ["isPublic"])
    .index("by_tags", ["tags"]),

  project_counters: defineTable({
    userId: v.id("users"),
    nextProjectNumber: v.number(),
  }).index("by_userId", ["userId"]),

  studio_profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    handle: v.string(),
    title: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    privacy: v.optional(v.string()),
    syncMode: v.optional(v.string()),
    color: v.optional(v.string()),
    customHex: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});

export default schema;
