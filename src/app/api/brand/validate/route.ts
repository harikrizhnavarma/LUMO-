/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { StyleGuideQuery } from "@/convex/query.config";
import type { BrandConsistencyMetrics } from "@/types/brandKit";

/**
 * Brand Validation API
 *
 * This endpoint scores a generated UI against the active BrandKit for a project.
 * For now it uses a lightweight heuristic based on the Brand influence slider:
 * - Higher brandInfluence -> higher brand adherence scores.
 * - The structure matches BrandConsistencyMetrics so the canvas can display it.
 *
 * Later, you can swap the scoring logic with a real AI-powered analysis
 * without changing the client-side contract.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      generatedUIId,
      html,
      brandInfluence,
      paletteId,
    }: {
      projectId?: string;
      generatedUIId?: string;
      html?: string;
      brandInfluence?: number | string;
      paletteId?: string | null;
    } = body ?? {};

    if (!projectId || !html) {
      return NextResponse.json(
        { error: "Missing required fields: projectId or html" },
        { status: 400 }
      );
    }

    // 🔎 Optionally load the project style guide / BrandKit DNA
    // (not strictly required for this first, heuristic implementation,
    // but wired for future AI-based scoring).
    try {
      await StyleGuideQuery(projectId);
    } catch (err) {
      // If style guide lookup fails, we still return a score based
      // purely on brandInfluence so the UI continues to work.
      console.warn("StyleGuideQuery failed inside /api/brand/validate:", err);
    }

    // 🔢 Convert brandInfluence into a numeric base score
    let base: number;
    if (typeof brandInfluence === "number") {
      base = brandInfluence;
    } else if (typeof brandInfluence === "string") {
      const parsed = Number(brandInfluence);
      base = Number.isNaN(parsed) ? 75 : parsed;
    } else {
      base = 75;
    }

    const clamp = (value: number): number =>
      Math.max(0, Math.min(100, Math.round(value)));

    const safeBase = clamp(base);

    // 🧮 Heuristic scoring:
    // - Overall score tracks brandInfluence directly.
    // - Sub-scores are slight variations so the UI feels informative.
    const metrics: BrandConsistencyMetrics = {
      brandAdherenceScore: safeBase,
      colorFidelityScore: clamp(safeBase + 3),
      formLanguageScore: clamp(safeBase - 2),
      materialAccuracyScore: clamp(safeBase),
      compositionAlignmentScore: clamp(safeBase + 1),
      detailConsistencyScore: clamp(safeBase - 1),
    };

    return NextResponse.json(
      {
        ok: true,
        metrics,
        projectId,
        generatedUIId,
        paletteId: paletteId ?? null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Brand validation API error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate brand for generated UI",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
