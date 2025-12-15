"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ColorSwatch = {
  name: string;
  hexColor: string;
  description?: string;
};

type ColorSection = {
  title: string;
  swatches: ColorSwatch[];
};

type LocalPalette = {
  id: string;
  name: string;
  type: string;
  strictness: number; // 0–100
  swatches: ColorSwatch[];
  createdAt: number;
};

interface BrandPalettesPanelProps {
  projectId: string;
  colorGuide: ColorSection[];
}

const STORAGE_KEY_PREFIX = "brandPalettes:";

export const BrandPalettesPanel: React.FC<BrandPalettesPanelProps> = ({
  projectId,
  colorGuide,
}) => {
  const [palettes, setPalettes] = useState<LocalPalette[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalPalette[];
        setPalettes(parsed);
      }

      const activeFromStorage = window.localStorage.getItem("brandPaletteId");
      if (activeFromStorage) {
        setActiveId(activeFromStorage);
      }
    } catch {
      // ignore bad JSON
    }
  }, [storageKey]);

  const flattenedSwatches = useMemo(() => {
    const all: ColorSwatch[] = [];
    for (const section of colorGuide ?? []) {
      if (!section?.swatches) continue;
      for (const swatch of section.swatches) {
        if (
          swatch?.hexColor &&
          !all.some(
            (s) =>
              s.hexColor.toLowerCase() === swatch.hexColor.toLowerCase(),
          )
        ) {
          all.push(swatch);
        }
      }
    }
    return all;
  }, [colorGuide]);

  const persistPalettes = (next: LocalPalette[]) => {
    setPalettes(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const handleTrainFromStyleGuide = () => {
    if (isTraining) return;
    setIsTraining(true);

    try {
      const baseSwatches =
        flattenedSwatches.length > 0 ? flattenedSwatches : [];

      const subset =
        baseSwatches.length <= 12
          ? baseSwatches
          : baseSwatches.slice(0, 12);

      const id = `palette_${Date.now()}`;
      const name = `Studio_Pristine ${palettes.length + 1}`;

      const newPalette: LocalPalette = {
        id,
        name,
        type: "studio_pristine",
        strictness: 75,
        swatches: subset,
        createdAt: Date.now(),
      };

      const next = [...palettes, newPalette];
      persistPalettes(next);

      toast.success("Palette trained from your style guide colors.", {
        description:
          "You can now set it as active for canvas generations.",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleUsePalette = (palette: LocalPalette) => {
    setActiveId(palette.id);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("brandPaletteId", palette.id);
      window.localStorage.setItem("brandPaletteName", palette.name);
    }

    toast.success("Active palette updated", {
      description:
        "Future AI generations from this device will use this palette.",
    });
  };

  // Clear all palettes
// NEW: Begin clearing palettes (opens modal)
const openClearPalettesModal = () => {
  setShowClearModal(true);
};

// NEW: Confirm deletion
const confirmClearPalettes = () => {
  // 1. Clear palettes for this project
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey);

    // 2. Clear active palette
    window.localStorage.removeItem("brandPaletteId");
    window.localStorage.removeItem("brandPaletteName");

    // 3. Notify canvas (brand bar updates)
    window.dispatchEvent(
      new StorageEvent("storage", { key: "brandPaletteName" })
    );
  }

  // 4. Reset state
  setPalettes([]);
  setActiveId(null);
  setShowClearModal(false);

  toast.success("All palettes cleared.", {
    description: "Your project no longer has any trained palettes.",
  });
};



  // If there are no colors at all, quietly hide the palettes section
  if (!colorGuide || colorGuide.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 border border-border/60 rounded-2xl p-5 sm:p-6 bg-background/40 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Brand palettes
          </div>
          <p className="text-xs text-muted-foreground max-w-xl mt-1">
            Palettes control <span className="font-semibold">how</span> your
            brand renders visually — lighting, atmosphere and mood — on top of
            your core BrandKit DNA.
          </p>
        </div>
        <Button
          size="sm"
          disabled={isTraining}
          onClick={handleTrainFromStyleGuide}
        >
          {isTraining ? "Training…" : "Train palette from style guide"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openClearPalettesModal}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear all palettes
        </Button>

      </div>

      {palettes.length === 0 ? (
        <div className="text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl p-4">
          No palettes saved yet for this project. Click{" "}
          <span className="font-medium">“Train palette from style guide”</span>{" "}
          to create your first rendering palette from the current color system.
        </div>
      ) : (
        <div className="space-y-3">
          {palettes.map((palette) => (
            <div
              key={palette.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 p-4",
                palette.id === activeId && "border-primary/80 bg-primary/5",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{palette.name}</span>
                  {palette.id === activeId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Strictness: {palette.strictness}% ·{" "}
                  {palette.swatches.length} colors
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {palette.swatches.map((swatch, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border border-border/40"
                      style={{ backgroundColor: swatch.hexColor }}
                      title={`${swatch.name} · ${swatch.hexColor}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={palette.id === activeId ? "outline" : "default"}
                  onClick={() => handleUsePalette(palette)}
                >
                  {palette.id === activeId ? "Using" : "Use palette"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Clear Palettes Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete all palettes?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This will permanently remove all trained palettes for this project.
            This action cannot be undone.
          </p>

          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearPalettes}>
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
