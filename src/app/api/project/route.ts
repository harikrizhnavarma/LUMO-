import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

interface AutosaveProjectRequest {
  projectId: string;
  userId: string;
  shapesData: {
    shapes: Record<string, unknown>;
    tool: string;
    selected: Record<string, unknown>;
    frameCounter: number;
  };
  viewportData?: {
    scale: number;
    translate: { x: number; y: number };
  };
}

/**
 * PATCH /api/project
 *
 * Autosaves the infinite canvas state into Convex.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AutosaveProjectRequest>;

    const { projectId, shapesData, viewportData } = body;

    if (!projectId || !shapesData) {
      return NextResponse.json(
        { error: "Missing projectId or shapesData" },
        { status: 400 }
      );
    }

    // Call Convex directly – no Inngest / background job.
    await fetchMutation(api.projects.updateProjectSketches, {
      projectId: projectId as any,
      sketchesData: shapesData,
      viewportData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project autosaved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/project] PATCH error:", error);
    return NextResponse.json(
      {
        error: "Failed to autosave project",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
