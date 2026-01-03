/* Generate Brandboard marks (logo, monogram, submark) from style guide + palette */

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const BrandMarksSchema = z.object({
  logoSvg: z.string().min(20),
  monogramSvg: z.string().min(10),
  submarkSvg: z.string().min(10),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body as { projectId?: string };

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "projectId is required" },
        { status: 400 }
      );
    }

    // Load the saved style guide (already aligned to moodboard)
    const styleGuide = await fetchQuery(
      api.projects.getProjectStyleGuide,
      { projectId: projectId as Id<"projects"> },
      { token: await convexAuthNextjsToken() }
    );

    if (!styleGuide) {
      return NextResponse.json(
        {
          success: false,
          message: "No style guide found. Generate one from the moodboard first.",
        },
        { status: 400 }
      );
    }

    const palette =
      (styleGuide as any)?.colorSections
        ?.flatMap((section: any) => section?.swatches ?? [])
        ?.map((swatch: any) => swatch?.hexColor)
        ?.filter((hex: unknown) => typeof hex === "string" && hex.startsWith("#")) ?? [];

    if (palette.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No colors found in style guide to build the marks.",
        },
        { status: 400 }
      );
    }

    const brandName = (styleGuide as any)?.theme || "Your Brand";

    const userPrompt = `
You are BrandKit AI. Create meaningful SVG marks (logo + monogram + submark) that visually convey the brand name and stay on-palette.

Brand name: ${brandName}
Palette (use only these hexes, prioritize first 3): ${palette.join(", ")}

Requirements:
- Logo: wordmark that clearly reads the brand name; include a symbol that references the name's concept/initials (e.g., first letter shape, a literal object suggested by the name, or a geometric motif derived from the letters). Convert text to paths—no <text> tags or external fonts.
- Monogram: single or paired initials, crafted as a distinctive ligature or shaped container that hints at the name meaning.
- Submark: circular/square badge variant that works at small sizes, reusing the core symbol/initials.
- Style: minimal, flat, vector-friendly. No gradients, raster images, or embedded data URLs. Center content in viewBox 512x512.
- Output JSON: { logoSvg, monogramSvg, submarkSvg, notes? } with lightweight, valid inline SVG strings. Use only the provided palette; default to first color for primary fills, second/third for contrast.
`.trim();

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: BrandMarksSchema,
      system:
        "You output concise JSON only. Produce lightweight inline SVG strings that validate and avoid scripts/styles.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "text", text: `Brand name: ${brandName}` },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      marks: result.object,
    });
  } catch (error) {
    console.error("Failed to generate brandboard marks", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate brand marks",
      },
      { status: 500 }
    );
  }
}
