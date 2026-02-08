"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  value: string;
  className?: string;
}

export const ColorSwatch = ({ name, value, className }: ColorSwatchProps) => {
  const normalized = value.replace("#", "");
  const hex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const labelClass =
    luminance > 0.62 ? "text-black/65" : "text-white/70";
  const codeClass =
    luminance > 0.62 ? "text-black/55" : "text-white/60";

  return (
    <div
      className={cn(
        "group relative aspect-square w-full cursor-pointer",
        className
      )}
    >
      <div
        className="absolute inset-0 border border-border/20 transition-all duration-500 ease-out will-change-transform skew-y-[-1.5deg] group-hover:scale-[1.02] group-hover:shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
        style={{ backgroundColor: value }}
      />
      <div
        className={cn(
          "absolute left-2 top-2 text-[10px] uppercase tracking-[0.18em]",
          labelClass
        )}
      >
        {name}
      </div>
      <div
        className={cn(
          "absolute right-2 bottom-2 text-[10px] font-mono uppercase",
          codeClass
        )}
      >
        {value}
      </div>
    </div>
  );
};
