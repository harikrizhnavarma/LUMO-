/* app/api/generate/route.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, type ImagePart, type TextPart } from 'ai'

import { prompts } from '@/prompts'
import {
  ConsumeCreditsQuery,
  CreditsBalanceQuery,
  InspirationImagesQuery,
  StyleGuideQuery,
} from '@/convex/query.config'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const projectId = formData.get('projectId') as string | null
    const brandInfluenceRaw = formData.get('brandInfluence') as string | null
    const imageRefsRaw = formData.get('imageRefs') as string | null

    let imageRefs: Array<{
      fileName: string
      dataUrl: string
      bounds: { x: number; y: number; w: number; h: number }
      absoluteBounds?: { x: number; y: number; w: number; h: number }
    }> = []

    if (imageRefsRaw) {
      try {
        const parsed = JSON.parse(imageRefsRaw)
        if (Array.isArray(parsed)) {
          imageRefs = parsed
            .filter(
              (ref) =>
                ref &&
                typeof ref.dataUrl === 'string' &&
                ref.bounds &&
                typeof ref.bounds.x === 'number' &&
                typeof ref.bounds.y === 'number' &&
                typeof ref.bounds.w === 'number' &&
                typeof ref.bounds.h === 'number'
            )
            .slice(0, 5)
            .map((ref) => ({
              fileName:
                typeof ref.fileName === 'string'
                  ? ref.fileName
                  : 'image-reference',
              dataUrl: ref.dataUrl,
              bounds: ref.bounds,
              absoluteBounds: ref.absoluteBounds,
            }))
        }
      } catch (err) {
        console.warn('Failed to parse imageRefs metadata:', err)
      }
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'No project selected' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // 1. Check credits
    const { ok: balanceOk, balance } = await CreditsBalanceQuery()

    if (!balanceOk) {
      return NextResponse.json(
        { error: 'Failed to get balance' },
        { status: 500 }
      )
    }

    if (balance === 0) {
      return NextResponse.json(
        { error: 'No credits available' },
        { status: 400 }
      )
    }

    // 2. Load style guide (with Brand DNA) and inspiration images
    const styleGuide = await StyleGuideQuery(projectId)
    const guide = styleGuide.styleGuide._valueJSON as any | null

    if (!guide) {
      return NextResponse.json(
        {
          error:
            'No style guide found. Please generate a BrandKit style guide first.',
        },
        { status: 400 }
      )
    }

    const inspirationImages = await InspirationImagesQuery(projectId)
    const images = inspirationImages.images._valueJSON as unknown as {
      url: string
    }[]
    const imageUrls = images.map((img) => img.url).filter(Boolean)

    // 3. Consume credits AFTER all important data is available
    const consume = await ConsumeCreditsQuery({
      amount: 1,
      reason: 'ai:ui-generation-brandkit',
    })

    if (!consume.ok) {
      return NextResponse.json(
        { error: 'no credits available' },
        { status: 400 }
      )
    }

    // 4. Convert sketch image to base64 for Claude Vision
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    // Extract tokens + Brand DNA extras safely
    const colors = guide.colorSections || []
    const typography = guide.typographySections || []

    const brandDna = guide.brandDna as
      | {
          summary: string
          visualLanguage: {
            formLanguage: string
            proportionSystems: string
            surfaceTreatment: string
            materialPalette: string
            colorPhilosophy: string
            lightingStyle: string
            compositionRules: string
            detailDensity: string
          }
          personality: {
            emotionalTone: string
            designEthos: string
            targetAudience: string
            brandValues: string[]
            competitivePositioning: string
          }
        }
      | undefined

    const brandRules = guide.brandRules as
      | {
          mandatoryRules: { name: string; description: string }[]
          guidanceRules: { name: string; description: string }[]
          contextSensitiveRules: {
            name: string
            description: string
            context?: string
          }[]
        }
      | undefined

    const brandBaseline = guide.brandBaseline as
      | {
          brandAdherenceScore: number
          colorFidelityScore: number
          formLanguageScore: number
          materialAccuracyScore: number
          compositionAlignmentScore: number
          detailConsistencyScore: number
        }
      | undefined

    // BrandKit Influence Slider (0–100)
    let brandInfluence = 75
    if (brandInfluenceRaw) {
      const parsed = Number(brandInfluenceRaw)
      if (!Number.isNaN(parsed)) {
        brandInfluence = Math.min(100, Math.max(0, parsed))
      }
    }

    const brandDnaText = brandDna
      ? `
Brand DNA summary:
${brandDna.summary}

Visual language:
- Form language: ${brandDna.visualLanguage.formLanguage}
- Proportion systems: ${brandDna.visualLanguage.proportionSystems}
- Surface treatment: ${brandDna.visualLanguage.surfaceTreatment}
- Material palette: ${brandDna.visualLanguage.materialPalette}
- Color philosophy: ${brandDna.visualLanguage.colorPhilosophy}
- Lighting style: ${brandDna.visualLanguage.lightingStyle}
- Composition rules: ${brandDna.visualLanguage.compositionRules}
- Detail density: ${brandDna.visualLanguage.detailDensity}

Personality:
- Emotional tone: ${brandDna.personality.emotionalTone}
- Design ethos: ${brandDna.personality.designEthos}
- Target audience: ${brandDna.personality.targetAudience}
- Brand values: ${brandDna.personality.brandValues.join(', ')}
- Competitive positioning: ${brandDna.personality.competitivePositioning}
`.trim()
      : `
No explicit Brand DNA object detected. Treat the styleGuide colors + typography as the primary brand definition and maintain strong consistency in color usage, hierarchy and typography rhythm.
      `.trim()

    const brandRulesText = brandRules
      ? `
Brand Rules Engine:

Mandatory rules (HARD constraints, must NEVER be broken):
${brandRules.mandatoryRules
  .map((r) => `- ${r.name}: ${r.description}`)
  .join('\n')}

Guidance rules (soft but strongly recommended):
${brandRules.guidanceRules
  .map((r) => `- ${r.name}: ${r.description}`)
  .join('\n')}

Context-sensitive rules (only apply in given contexts):
${brandRules.contextSensitiveRules
  .map(
    (r) =>
      `- ${r.name} [${r.context ?? 'generic'}]: ${r.description}`
  )
  .join('\n')}
`.trim()
      : `
No explicit Brand Rules Engine was provided. 
You must still:
- Never invent colors or fonts that are not implied by the styleGuide.
- Maintain consistent usage of primary / secondary / accent colors.
- Keep typography hierarchy consistent across the layout.
      `.trim()

    const baselineText = brandBaseline
      ? `
BrandKit baseline scores from initial training:
- Brand Adherence: ${brandBaseline.brandAdherenceScore}/100
- Color Fidelity: ${brandBaseline.colorFidelityScore}/100
- Form Language: ${brandBaseline.formLanguageScore}/100
- Material Accuracy: ${brandBaseline.materialAccuracyScore}/100
- Composition Alignment: ${brandBaseline.compositionAlignmentScore}/100
- Detail Consistency: ${brandBaseline.detailConsistencyScore}/100
      `.trim()
      : ''

    const imageRefPositionText =
      imageRefs.length > 0
        ? imageRefs
            .map((ref, index) => {
              const { x, y, w, h } = ref.bounds
              return `Ref ${index + 1}: normalized box x=${x.toFixed(
                3
              )}, y=${y.toFixed(3)}, w=${w.toFixed(3)}, h=${h.toFixed(
                3
              )}. Keep a visually similar image anchored here.`
            })
            .join('\n')
        : ''

    const imageRefAttachments: ImagePart[] =
      imageRefs.length > 0
        ? imageRefs.map((ref) => ({
            type: 'image',
            image: ref.dataUrl.startsWith('data:')
              ? ref.dataUrl.split(',')[1] ?? ref.dataUrl
              : ref.dataUrl,
            mediaType: ref.dataUrl.startsWith('data:')
              ? ref.dataUrl.split(';')[0]?.replace('data:', '')
              : undefined,
          }))
        : []

    const systemPrompt = prompts.generativeUi.system

    const userPrompt = `
You are BrandKit UI Generator inside LUMO.

Your job:
- Take the user's sketch (image) and the BrandKit styleGuide (including Brand DNA and Rules if present).
- Produce a single-page HTML UI layout that is a PERFECT representation of the brand.

STYLE GUIDE TOKENS
These are the actual design tokens you must honour:

Colors:
${colors
  .map((color: any) =>
    color.swatches
      .map(
        (swatch: any) =>
          `${swatch.name}: ${swatch.hexColor} – ${swatch.description ?? ''}`
      )
      .join(', ')
  )
  .join('\n')}

Typography:
${typography
  .map((section: any) =>
    section.styles
      .map(
        (style: any) =>
          `${style.name}: ${style.description ?? ''} | ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}/${style.lineHeight}`
      )
      .join(', ')
  )
  .join('\n')}

${imageRefPositionText ? `Reference image boxes (keep placement):\n${imageRefPositionText}` : ''}

BRAND DNA (WHAT the brand is):
${brandDnaText}

BRAND RULES ENGINE:
${brandRulesText}

BRAND BASELINE (training snapshot):
${baselineText}

BRANDKIT INFLUENCE SLIDER: ${brandInfluence}/100

- At 0–25: you are allowed to be more experimental while still being aesthetically coherent, but you must not be chaotic.
- At 50: balance new ideas with clear brand cues from Brand DNA and tokens.
- At 75–100: you must strongly enforce the Brand DNA and rules. No off-brand experiments.

APPLICATION RULES:

1. Strict token usage
   - Map all colors to the styleGuide swatches (use Tailwind v4 arbitrary colors: text-[#RRGGBB], bg-[#RRGGBB], border-[#RRGGBB], etc.).
   - Map typography scale and rhythm strictly to the defined styles.
   - Do NOT invent new colors or fonts.

2. Accessibility & composition
   - Enforce WCAG AA contrast (≥4.5:1 body, ≥3:1 large text).
   - Keep composition, spacing and hierarchy consistent with Brand DNA (layout, negative space, focal points).

3. Brand rules enforcement
   - Mandatory rules MUST never be broken.
   - Guidance rules should be followed unless the sketch clearly demands small deviations.
   - Context-sensitive rules apply when the layout or content matches the context.

4. Inspiration images
   - You will receive a set of inspiration images (URLs).
   - Use them only to bias choices WITHIN the existing tokens (which colors/sections to emphasise, which typography style, etc.).
   - Do NOT derive brand-new tokens from them.
   - If images are unreachable, ignore them.

5. Output
   - Return ONLY valid HTML (no JSON wrapper).
   - No external CSS or JS; use Tailwind utility classes inline.
   - Do not echo the image URLs in the HTML.

Think like a senior brand designer + front-end engineer.
    `.trim()

    const contentBlocks: Array<TextPart | ImagePart> = [
      {
        type: 'text',
        text: userPrompt,
      },
      {
        type: 'image',
        image: base64Image,
        mediaType: imageFile.type,
      },
      ...imageRefAttachments,
      // Add any extra inspiration images (if stored on project)
      ...imageUrls.map((url) => ({
        type: 'image' as const,
        image: url,
      })),
    ]

    if (imageRefPositionText) {
      contentBlocks.push({
        type: 'text',
        text: `Reference image boxes:\n${imageRefPositionText}`,
      })
    }

    const result = streamText({
      model: anthropic('claude-opus-4-20250514'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: contentBlocks,
        },
      ],
      temperature: 0.7,
    })

    // Stream HTML back to the browser
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate UI design',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
