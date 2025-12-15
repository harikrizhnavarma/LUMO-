"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useAutosaveProjectMutation } from "@/redux/api/project";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export const Autosave = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const user = useAppSelector((state) => state.profile);
  const shapesState = useAppSelector((state) => state.shapes);
  const viewportState = useAppSelector((state) => state.viewport);

  const [autosaveProject, { isLoading: isSaving }] =
    useAutosaveProjectMutation();

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const isReady = Boolean(projectId && user?.id);

  useEffect(() => {
    if (!isReady) return;

    // ✅ Trim what we send to Convex (no past/future history, no extra slice data)
    const shapesData = {
      shapes: shapesState.shapes,
      tool: shapesState.tool,
      selected: shapesState.selected,
      frameCounter: shapesState.frameCounter,
    };

    const stateString = JSON.stringify({
      shapes: shapesData,
      viewport: viewportState,
    });

    // Skip if nothing changed
    if (stateString === lastSavedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      lastSavedRef.current = stateString;

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setSaveStatus("saving");

      try {
        await autosaveProject({
          projectId: projectId as string,
          userId: user?.id as string,
          // ✅ send the trimmed payload, not the entire Redux slice
          shapesData,
          viewportData: {
            scale: viewportState.scale,
            translate: viewportState.translate,
          },
        }).unwrap();

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
        console.error("[Autosave] Failed to autosave project", err);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    isReady,
    // Only re-run when these actually change
    shapesState.shapes,
    shapesState.tool,
    shapesState.selected,
    shapesState.frameCounter,
    viewportState,
    projectId,
    user?.id,
    autosaveProject,
  ]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!isReady) return null;

  if (isSaving) {
    return (
      <div className="flex items-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  switch (saveStatus) {
    case "saved":
      return (
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4" />
        </div>
      );
    case "error":
      return (
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    default:
      return <></>;
  }
};
