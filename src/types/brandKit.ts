// Core BrandKit subscription / usage tier
export type BrandKitTier =
  | "personal"
  | "professional"
  | "enterprise"
  | "collaborative";

// 1. Brand DNA Profile ---------------------------------------------

export interface BrandVisualLanguageParameters {
  // Form Language: Geometric vs organic, simple vs complex etc.
  formLanguage?: string;
  // Proportion Systems: golden ratio, aspect ratios, scale relationships
  proportionSystems?: string[];
  // Surface Treatment: texture preferences, finish types, detailing
  surfaceTreatment?: string;
  // Material Palette: primary / secondary / accent materials
  materialPalette?: {
    primary?: string[];
    secondary?: string[];
    accent?: string[];
  };
  // Color Philosophy: palette and relationships
  colorPhilosophy?: {
    primary?: string[];
    secondary?: string[];
    accent?: string[];
    relationships?: string; // e.g. "analogous warm palette with cool accents"
  };
  // Lighting Style: dramatic vs subtle, hard vs soft shadows
  lightingStyle?: string;
  // Composition Rules: layout, negative space, focal points
  compositionRules?: {
    layout?: string;
    negativeSpace?: string;
    focalPoints?: string;
  };
  // Detail Density: minimalist vs ornate, detail concentration
  detailDensity?: string;
}

export interface BrandPersonalityAttributes {
  emotionalTone?: string; // luxury, playful, professional, innovative...
  designEthos?: string; // sustainable, tech-forward, heritage-inspired...
  targetAudience?: {
    demographics?: string;
    psychographics?: string;
  };
  brandValues?: string[]; // core principles in design
  competitivePositioning?: string; // visual differentiation / market position
}

export interface BrandDNAProfile {
  visualLanguage: BrandVisualLanguageParameters;
  personality: BrandPersonalityAttributes;
}

// 2. Visual Training Library --------------------------------------

export type BrandTrainingImageCategory =
  | "hero_products"
  | "material_finish"
  | "form_language"
  | "environmental_context"
  | "color_applications"
  | "typography_graphics";

export interface VisualTrainingLibraryStats {
  totalImages: number;
  byCategory: Partial<Record<BrandTrainingImageCategory, number>>;
  // Mirrors: minimum / recommended / optimal ranges in your spec
  recommendedRanges: {
    minimum: number; // e.g. 25
    recommended: [number, number]; // e.g. [60, 100]
    optimal: [number, number]; // e.g. [150, 200]
  };
}

// 3. Brand Rules Engine -------------------------------------------

export interface BrandMandatoryRules {
  // Hard constraints
  enforceBrandColorAccuracy?: boolean;
  colorDeltaETolerance?: number; // ΔE tolerance
  prohibitedColorCombinations?: string[];
  requiredMaterialPairings?: string[];
  mandatoryLogoPlacement?: string;
  signatureFormElements?: string[];
  restrictedStylisticApproaches?: string[];
}

export interface BrandGuidanceRules {
  // Soft constraints
  preferredProportionSystems?: string[];
  recommendedMaterialCombinations?: string[];
  suggestedCompositionApproaches?: string[];
  typicalDetailDensity?: string;
}

export interface BrandContextualRules {
  // Context-sensitive rules
  productCategoryGuidelines?: Record<string, string>;
  marketSegmentAdaptations?: Record<string, string>;
  regionalVariations?: Record<string, string>;
  seasonalConsiderations?: Record<string, string>;
}

export interface BrandRulesEngineConfig {
  mandatory: BrandMandatoryRules;
  guidance: BrandGuidanceRules;
  context: BrandContextualRules;
}

// 4. Brand Analytics & Intelligence -------------------------------

export interface BrandConsistencyMetrics {
  brandAdherenceScore?: number; // 0–100
  colorFidelityScore?: number;
  formLanguageScore?: number;
  materialAccuracyScore?: number;
  compositionAlignmentScore?: number;
  detailConsistencyScore?: number;
}

export interface BrandUsageAnalytics {
  mostUsedBrandElements?: string[];
  commonDeviations?: string[];
  designerPatterns?: string[];
  teamConsistencyMetrics?: Record<string, number>;
  temporalConsistencyTrends?: Array<{
    period: string; // e.g. "2025-12"
    brandAdherenceScore: number;
  }>;
}

export interface BrandAnalyticsSummary {
  consistencyMetrics?: BrandConsistencyMetrics;
  usageAnalytics?: BrandUsageAnalytics;
}

// 5. BrandKit Palettes --------------------------------------------

// Matches your spec: Studio_Pristine, Studio_Dramatic, etc.
export type BrandPaletteType =
  | "studio_pristine"
  | "studio_dramatic"
  | "environment_urban"
  | "environment_track"
  | "clay_development"
  | "technical_cutaway"
  | "custom";

export interface BrandPaletteSwatch {
  name: string;
  hexColor: string;
  role?: string; // e.g. "background", "accent", "status-success"
  description?: string;
}

export interface BrandPaletteTrainingConfig {
  // From spec 3.1 (Palette vs BrandKit distinction)
  emphasisAreas?: string[]; // ["lighting", "atmosphere", "contrast", ...]
  strictness: number; // 0–100: how tightly this palette should be enforced
  trainedFrom?: "moodboard" | "upload" | "mixed";
  trainingImageCount: number;
  notes?: string;
}

export interface BrandPaletteUsageStats {
  timesUsed: number;
  lastUsedAt?: number;
  averageBrandScore?: number; // mean Brand Adherence score when this palette was used
}

export interface BrandPalette {
  id?: string; // Convex _id as string on client
  userId: string;
  brandId?: string | null;
  projectId?: string | null; // optional project-scoped palettes
  name: string;
  slug: string;
  type: BrandPaletteType;
  description?: string;
  strictness: number; // 0–100
  isDefault: boolean;
  swatches: BrandPaletteSwatch[];
  trainingConfig?: BrandPaletteTrainingConfig;
  usageStats?: BrandPaletteUsageStats;
  createdAt?: number;
  updatedAt?: number;
}

// Palette library per brand
export interface BrandPaletteLibrary {
  brandId: string;
  palettes: BrandPalette[];
}

// 6. Full BrandKit Profile (per brand) ----------------------------

export interface BrandKitProfile {
  id?: string; // Convex document _id when hydrated client-side
  brandId: string;
  tier: BrandKitTier;
  dnaProfile?: BrandDNAProfile;
  trainingLibrary?: VisualTrainingLibraryStats;
  rulesEngine?: BrandRulesEngineConfig;
  analyticsSummary?: BrandAnalyticsSummary;
  createdAt?: number;
  updatedAt?: number;
  isActive?: boolean;
}

export interface BrandWithKit {
  _id: string; // Convex document id for the brand

  name: string;
  description?: string;
  styleGuide?: string;
  moodBoardImages?: string[];
  brandKit?: BrandKitProfile | null;
  updatedAt: number;
}

