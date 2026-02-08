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

const buildFallbackMarks = (brandName: string, palette: string[]) => {
  const primary = palette[0] ?? "#111111";
  const secondary = palette[1] ?? "#ffffff";
  const letter = brandName.trim().charAt(0).toUpperCase() || "B";

  const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128" viewBox="0 0 512 128">
  <rect width="512" height="128" fill="none"/>
  <circle cx="48" cy="64" r="32" fill="${primary}"/>
  <text x="48" y="71" text-anchor="middle" font-size="32" font-family="Arial, sans-serif" fill="${secondary}">${letter}</text>
  <text x="96" y="74" font-size="42" font-family="Arial, sans-serif" fill="${primary}" letter-spacing="2">${brandName}</text>
</svg>`.trim();

  const monogramSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="${primary}"/>
  <text x="256" y="290" text-anchor="middle" font-size="180" font-family="Arial, sans-serif" fill="${secondary}">${letter}</text>
</svg>`.trim();

  const submarkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="210" fill="${secondary}" stroke="${primary}" stroke-width="18"/>
  <text x="256" y="300" text-anchor="middle" font-size="140" font-family="Arial, sans-serif" fill="${primary}">${letter}</text>
</svg>`.trim();

  return { logoSvg, monogramSvg, submarkSvg, notes: "Fallback marks" };
};

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
- Logo: wordmark that clearly reads the brand name; include a symbol that references the name's concept/initials (e.g., first letter shape, a literal object suggested by the name, or a geometric motif derived from the letters). Convert text to paths; no <text> tags or external fonts.
- Monogram: single or paired initials, crafted as a distinctive ligature or shaped container that hints at the name meaning.
- Submark: circular/square badge variant that works at small sizes, reusing the core symbol/initials.
- Style: minimal, flat, vector-friendly. No gradients, raster images, or embedded data URLs. Center content in viewBox 512x512.
- Output JSON: { logoSvg, monogramSvg, submarkSvg, notes? } with lightweight, valid inline SVG strings. Use only the provided palette; default to first color for primary fills, second/third for contrast.
`.trim();

    try {
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
      console.error("Brand marks AI failed, returning fallback marks", error);
      return NextResponse.json({
        success: true,
        marks: buildFallbackMarks(brandName, palette),
      });
    }
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
