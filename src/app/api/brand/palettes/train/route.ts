/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import z from "zod";

import {
  CreditsBalanceQuery,
  ConsumeCreditsQuery,
  MoodBoardImagesQuery,
} from "@/convex/query.config";
import { MoodBoardImage } from "@/hooks/use-styles";
import {
  SaveBrandPaletteMutation,
} from "@/convex/query.config";

// Palette schema that Claude must respect
const PaletteSwatchSchema = z.object({
  name: z.string(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color"),
  role: z.string().optional(),
  description: z.string().optional(),
});

const PaletteSchema = z.object({
  name: z.string(),
  description: z.string(),
  swatches: z.array(PaletteSwatchSchema).min(4).max(24),
  trainingNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      projectId,
      brandId,
      paletteName,
      paletteType,
      strictness,
      emphasisAreas,
    } = body as {
      projectId?: string;
      brandId?: string | null;
      paletteName?: string;
      paletteType?: string;
      strictness?: number;
      emphasisAreas?: string[];
    };

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!paletteName || !paletteType) {
      return NextResponse.json(
        { success: false, message: "Palette name and type are required" },
        { status: 400 }
      );
    }

    const influence = typeof strictness === "number" ? strictness : 75;

    // 1. Check credits
    const { ok: balanceOk, balance } = await CreditsBalanceQuery();
    if (!balanceOk) {
      return NextResponse.json(
        { success: false, message: "Failed to get balance" },
        { status: 500 }
      );
    }

    if (balance === 0) {
      return NextResponse.json(
        { success: false, message: "No credits available" },
        { status: 400 }
      );
    }

    // 2. Load moodboard images (training images for palette)
    const moodBoardImages = await MoodBoardImagesQuery(projectId);
    if (!moodBoardImages || moodBoardImages.images._valueJSON.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No mood board images found. Please upload images before training a palette.",
        },
        { status: 400 }
      );
    }

    const images = moodBoardImages.images
      ._valueJSON as unknown as MoodBoardImage[];
    const imageUrls = images.map((img) => img.url).filter(Boolean);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid image URLs found in mood board",
        },
        { status: 400 }
      );
    }

    // 3. Consume one credit for palette training
    const consume = await ConsumeCreditsQuery({
      amount: 1,
      reason: "ai:palette-training",
    });

    if (!consume.ok) {
      return NextResponse.json(
        { success: false, message: "No credits available" },
        { status: 400 }
      );
    }

    const trainingImagesCount = imageUrls.length;

    // 4. Call Claude to generate the palette
    const userPrompt = `
You are BrandKit Palette Trainer.

Train a CUSTOM RENDERING PALETTE for a product design brand, using the provided images as the training set.

- The palette controls HOW the brand renders (lighting, atmosphere, mood), NOT WHAT the brand is.
- Base your decisions purely on the images: color usage, contrast, lighting, saturation, atmosphere.

You MUST return a JSON object matching this schema:

{
  "name": string,  // short name for the palette, you may adjust the provided paletteName if needed
  "description": string, // 1-3 sentences describing WHEN and WHY to use this palette
  "swatches": [
    {
      "name": string,
      "hexColor": "#RRGGBB",
      "role": string,        // e.g. "background", "primary accent", "shadow", "highlight"
      "description": string  // how to use this color in renders
    },
    ...
  ],
  "trainingNotes": string   // optional, comments about lighting / atmosphere / what this palette emphasizes
}

Constraints:
- Minimum 4 swatches, maximum 24.
- Colors must be distinct and practically useful as a working palette.
- Respect the idea of palette TYPE: ${paletteType}.
- Consider these emphasis areas (if any): ${(emphasisAreas ?? []).join(", ") || "none specified"}.
- STRICTNESS: ${influence}/100 – higher means the palette should be more focused and less experimental.
    `.trim();

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: PaletteSchema,
      system:
        "You output only JSON that matches the given schema. Never include commentary.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            ...imageUrls.map((url) => ({
              type: "image" as const,
              image: url as string,
            })),
          ],
        },
      ],
    });

    const palette = result.object;

    // 5. Save palette via Convex
    await SaveBrandPaletteMutation({
      brandId: brandId ?? null,
      projectId,
      name: palette.name || paletteName,
      type: paletteType,
      description: palette.description,
      strictness: influence,
      swatches: palette.swatches,
      trainingConfig: {
        emphasisAreas: emphasisAreas ?? [],
        strictness: influence,
        trainedFrom: "moodboard",
        trainingImageCount: trainingImagesCount,
        notes: palette.trainingNotes,
      },
    });

    return NextResponse.json({
      success: true,
      palette,
      trainingImagesCount,
      balance: consume.balance,
    });
  } catch (error) {
    console.error("Error training palette:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to train palette",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
