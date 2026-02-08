"use client";

import React from "react";
import { FrameShape } from "@/redux/slice/shapes";
import { Button } from "@/components/ui/button";
import { Brush, Palette } from "lucide-react";
import { useFrame } from "@/hooks/use-canvas";

export const Frame = ({
  shape,
  toggleInspiration,
}: {
  shape: FrameShape;
  toggleInspiration: () => void;
}) => {
  const { isGenerating, handleGenerateDesign } = useFrame(shape);

  return (
    <>
      {/* Frame body */}
      <div
        className="
          absolute pointer-events-none 
          rounded-xl 
          bg-neutral-50/80 dark:bg-white/5 
          border border-neutral-300 dark:border-white/15 
          shadow-md dark:shadow-none
        "
        style={{
          left: shape.x,
          top: shape.y,
          width: shape.w,
          height: shape.h,
        }}
      />

      {/* Header: label + buttons */}
      <div
        className="
          absolute flex items-center gap-2 pointer-events-auto
        "
        style={{
          left: shape.x + 12,
          top: shape.y - 34,
          zIndex: 80,
        }}
      >
        {/* Frame label pill */}
        <span
          className="
            text-[11px] font-medium whitespace-nowrap 
            px-2.5 py-0.5 rounded-md 
            bg-[var(--canvas-panel-strong)] text-[var(--canvas-panel-text)] 
            border border-[var(--canvas-panel-border)] 
            shadow-sm
          "
        >
          Frame {shape.frameNumber}
        </span>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Inspiration */}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={toggleInspiration}
            className="
              h-7 rounded-md px-2.5 text-[11px] 
              flex items-center gap-1
              bg-[var(--canvas-panel)] 
              text-[var(--canvas-panel-text)] 
              border border-[var(--canvas-panel-border)] 
              hover:bg-[var(--canvas-panel-hover-strong)]
            "
          >
            <Palette className="w-3 h-3" />
            Inspiration
          </Button>

          {/* Generate design */}
          <Button
            type="button"
            size="sm"
            onClick={handleGenerateDesign}
            disabled={isGenerating}
            className="
              h-7 rounded-md px-2.5 text-[11px] 
              flex items-center gap-1
              bg-[var(--canvas-accent)] text-white dark:text-black
              hover:opacity-90
              disabled:opacity-60 disabled:cursor-not-allowed
              border border-[var(--canvas-accent)]
            "
          >
            <Brush
              className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Generating..." : "Generate design"}
          </Button>
        </div>
      </div>
    </>
  );
};
