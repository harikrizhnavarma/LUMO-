/* app/api/generate/style/route.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import z from 'zod'

import {
  CreditsBalanceQuery,
  ConsumeCreditsQuery,
  MoodBoardImagesQuery,
} from '@/convex/query.config'
import { prompts } from '@/prompts'
import { MoodBoardImage } from '@/hooks/use-styles'
import { fetchMutation } from 'convex/nextjs'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { api } from '@/../convex/_generated/api'
import type { Id } from '@/../convex/_generated/dataModel'


/**
 * === CORE DESIGN TOKENS (existing Style Guide) ===
 */

const ColorSwatchSchema = z.object({
  name: z.string(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
  description: z.string().optional(),
})

const PrimaryColorsSchema = z.object({
  title: z.literal('Primary Colours'),
  swatches: z.array(ColorSwatchSchema).length(4),
})

const SecondaryColorsSchema = z.object({
  title: z.literal('Secondary & Accent Colors'),
  swatches: z.array(ColorSwatchSchema).length(4),
})

const UIComponentColorsSchema = z.object({
  title: z.literal('UI Component Colors'),
  swatches: z.array(ColorSwatchSchema).length(6),
})

const UtilityColorsSchema = z.object({
  title: z.literal('Utility & Form Colors'),
  swatches: z.array(ColorSwatchSchema).length(3),
})

const StatusColorsSchema = z.object({
  title: z.literal('Status & Feedback Colors'),
  swatches: z.array(ColorSwatchSchema).length(2),
})

const TypographyStyleSchema = z.object({
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  lineHeight: z.string(),
  letterSpacing: z.string().optional(),
  description: z.string().optional(),
})

const TypographySectionSchema = z.object({
  title: z.string(),
  styles: z.array(TypographyStyleSchema),
})

/**
 * === BRAND DNA ENGINE EXTENSION (Step 2) ===
 * We encode the Brand DNA, rules engine and baseline scores
 * directly into the style guide object.
 */

// Visual language: how the brand “looks”
const BrandVisualLanguageSchema = z.object({
  formLanguage: z.string(), // geometric vs organic, simple vs complex
  proportionSystems: z.string(), // e.g. golden ratio, 4pt grid, aspect ratios
  surfaceTreatment: z.string(), // textures, finishes, detailing approach
  materialPalette: z.string(), // primary / secondary / accent materials
  colorPhilosophy: z.string(), // how colors are used, hierarchy
  lightingStyle: z.string(), // dramatic vs subtle, hard vs soft shadows, etc.
  compositionRules: z.string(), // layout, negative space, focal points
  detailDensity: z.string(), // minimalist vs ornate, where details concentrate
})

// Brand personality / positioning
const BrandPersonalitySchema = z.object({
  emotionalTone: z.string(), // luxury, playful, professional, innovative, etc.
  designEthos: z.string(), // sustainable, tech-forward, heritage-inspired…
  targetAudience: z.string(), // key demographics / psychographics summary
  brandValues: z.array(z.string()), // 3–7 core value statements
  competitivePositioning: z.string(), // how visuals differentiate from competitors
})

// High-level DNA fingerprint
const BrandDnaSchema = z.object({
  summary: z.string(), // 3–5 sentence “Brand DNA” narrative
  visualLanguage: BrandVisualLanguageSchema,
  personality: BrandPersonalitySchema,
})

// Rules used by the Brand Rules Engine
const BrandRuleSchema = z.object({
  id: z.string(), // stable key for this rule
  name: z.string(), // short label (“Primary color usage”, etc.)
  description: z.string(), // what the rule enforces / recommends
  type: z.enum(['mandatory', 'guidance', 'context']),
  appliesTo: z
    .array(
      z.enum([
        'color',
        'typography',
        'layout',
        'material',
        'detail',
        'lighting',
        'composition',
      ])
    )
    .optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(), // for UI later
  context: z.string().optional(), // e.g. “mobile hero banners”, “APAC market”
})

const BrandRulesSchema = z.object({
  mandatoryRules: z.array(BrandRuleSchema), // hard constraints
  guidanceRules: z.array(BrandRuleSchema), // soft recommendations
  contextSensitiveRules: z.array(BrandRuleSchema), // per-category / per-region
})

// Baseline scores from initial training (used later for analytics)
const BrandBaselineScoresSchema = z.object({
  brandAdherenceScore: z.number().min(0).max(100),
  colorFidelityScore: z.number().min(0).max(100),
  formLanguageScore: z.number().min(0).max(100),
  materialAccuracyScore: z.number().min(0).max(100),
  compositionAlignmentScore: z.number().min(0).max(100),
  detailConsistencyScore: z.number().min(0).max(100),
})

// Training metadata (Stage 1–3, image counts, etc.)
const BrandTrainingMetaSchema = z.object({
  trainingImagesCount: z.number(), // how many images were actually used
  recommendedRange: z.string(), // “basic / recommended / optimal” etc.
  stagesCompleted: z.array(z.enum(['analysis', 'pattern-learning', 'validation'])),
  qualityNotes: z.string().optional(), // comments about coverage / gaps
})

/**
 * Full Style Guide including Brand DNA & Brand Rules
 */
const StyleGuideSchema = z.object({
  theme: z.string(),
  description: z.string(),
  colorSections: z.tuple([
    PrimaryColorsSchema,
    SecondaryColorsSchema,
    UIComponentColorsSchema,
    UtilityColorsSchema,
    StatusColorsSchema,
  ]),
  typographySections: z.array(TypographySectionSchema).length(3),

  // === BrandKit Step 2 additions ===
  brandDna: BrandDnaSchema,
  brandRules: BrandRulesSchema,
  brandBaseline: BrandBaselineScoresSchema,
  trainingMeta: BrandTrainingMetaSchema,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId } = body as { projectId?: string }

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      )
    }

    // 1. Check credits first
    const { ok: balanceOk, balance } = await CreditsBalanceQuery()

    if (!balanceOk) {
      return NextResponse.json(
        { success: false, message: 'Failed to get balance' },
        { status: 500 }
      )
    }

    if (balance === 0) {
      return NextResponse.json(
        { success: false, message: 'No credits available' },
        { status: 400 }
      )
    }

    // 2. Load moodboard images (this is the training library for BrandKit)
    const moodBoardImages = await MoodBoardImagesQuery(projectId)
    if (!moodBoardImages || moodBoardImages.images._valueJSON.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No mood board images found. Please upload images to the mood board first.',
        },
        { status: 400 }
      )
    }

    const images = moodBoardImages.images
      ._valueJSON as unknown as MoodBoardImage[]
    const imageUrls = images.map((img) => img.url).filter(Boolean)

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid image URLs found in mood board',
        },
        { status: 400 }
      )
    }

    // 3. Consume credits **after** validation, before heavy AI call
    const consume = await ConsumeCreditsQuery({
      amount: 1,
      reason: 'ai:style-guide-brandkit',
    })

    if (!consume.ok) {
      return NextResponse.json(
        { success: false, message: 'No credits available' },
        { status: 400 }
      )
    }

    const remainingBalance = consume.balance

    // 4. Call the BrandKit Style Guide + Brand DNA engine
    const systemPrompt = prompts.styleGuide.system

    const userPrompt = `
You are BrandKit AI inside LUMO.

You will perform the full Brand DNA Engine training on the provided mood board images in THREE stages and then output a single JSON object that matches the schema:

1) Build a full UI style guide (colors + typography) for digital product design.
2) Derive a multi-dimensional Brand DNA profile from the images:
   - Visual language (form, proportions, materials, surface treatment, lighting, composition, detail density).
   - Brand personality (emotional tone, design ethos, target audience, brand values, competitive positioning).
3) Construct a Brand Rules Engine:
   - mandatoryRules = hard constraints that must NEVER be broken (brand colors, logo usage, forbidden combinations, etc.).
   - guidanceRules = soft rules that are strongly recommended but can be bent.
   - contextSensitiveRules = rules that apply only in certain product categories, regions or seasonal campaigns.
4) Estimate baseline brand scores for this training set:
   - brandAdherenceScore (0–100)
   - colorFidelityScore
   - formLanguageScore
   - materialAccuracyScore
   - compositionAlignmentScore
   - detailConsistencyScore
   These are NOT per-image scores but a global baseline that captures how coherent the brand vocabulary is across the training set.
5) Fill trainingMeta:
   - trainingImagesCount = number of images you actually used.
   - recommendedRange = string like "basic (25–59)", "recommended (60–100)" or "optimal (150–200)" based on the spec.
   - stagesCompleted must be ["analysis","pattern-learning","validation"].
   - qualityNotes = short comments about gaps (e.g. "few typography samples").

IMPORTANT:
- Respect the schema exactly. Do not add or remove top-level keys.
- All descriptive fields should be concise but specific, written for designers and brand managers.
- Brand DNA and rules MUST be consistent with the colors/typography you output.
    `.trim()

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: StyleGuideSchema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            // Attach moodboard images as multimodal input
            ...imageUrls.map((url) => ({
              type: 'image' as const,
              image: url as string,
            })),
          ],
        },
      ],
    })

    // 5. Persist style guide + Brand DNA into the project
    await fetchMutation(
      api.projects.updateProjectStyleGuide,
      {
        projectId: projectId as Id<'projects'>,
        styleGuideData: result.object,
      },
      { token: await convexAuthNextjsToken() }
    )

    return NextResponse.json({
      success: true,
      styleGuide: result.object,
      message: 'Style guide & Brand DNA generated successfully',
      balance: remainingBalance,
    })
  } catch (error) {
    console.error('Error generating style guide / brand DNA:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate style guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
