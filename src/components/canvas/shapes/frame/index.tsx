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
          top: shape.y - 40,
          zIndex: 80,
        }}
      >
        {/* Frame label pill */}
        <span
          className="
            text-xs font-medium 
            px-3 py-1 rounded-full 
            bg-neutral-900 text-white 
            dark:bg-white dark:text-black 
            border border-neutral-200 dark:border-white/30 
            shadow-sm
          "
        >
          Frame {shape.frameNumber}
        </span>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Inspiration */}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={toggleInspiration}
            className="
              h-8 rounded-full px-3 text-xs 
              flex items-center gap-1
              bg-neutral-200/90 dark:bg-white/10 
              text-neutral-800 dark:text-white 
              border border-neutral-300 dark:border-white/25 
              hover:bg-neutral-300 dark:hover:bg-white/20
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
              h-8 rounded-full px-3 text-xs 
              flex items-center gap-1
              bg-neutral-900 text-white 
              hover:bg-neutral-800
              disabled:opacity-60 disabled:cursor-not-allowed
              dark:bg-white dark:text-black 
              dark:hover:bg-white/90 
              dark:border dark:border-white/30
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
