"use client";

import React, { useEffect, useState } from "react";

export const BrandInfluenceControl: React.FC = () => {
  const [influence, setInfluence] = useState(75);
  const [paletteName, setPaletteName] = useState<string | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedInfluence = window.localStorage.getItem("brandInfluence");
    if (storedInfluence !== null) {
      const parsed = Number(storedInfluence);
      if (!Number.isNaN(parsed)) {
        setInfluence(Math.min(100, Math.max(0, parsed)));
      }
    }

    const storedPaletteName = window.localStorage.getItem("brandPaletteName");
    if (storedPaletteName) {
      setPaletteName(storedPaletteName);
    }
  }, []);

  // Listen for palette changes from other components / tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      const storedPaletteName = window.localStorage.getItem("brandPaletteName");
      setPaletteName(storedPaletteName);
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    const clamped = Math.min(100, Math.max(0, value));
    setInfluence(clamped);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("brandInfluence", String(clamped));
    }
  };

  return (
    <div
      className="fixed top-27 left-0 z-30 pointer-events-none px-8"
      style={{ right: "min(58rem, 46vw)" }}
    >
      <div className="inline-flex items-center gap-4 pointer-events-auto">
        <div className="px-4 py-2 rounded-xlbackdrop-blur-xl
                        bg-neutral-100/80 dark:bg-black/40
                        border border-neutral-300 dark:border-white/10
                        shadow-sm"
        >
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Brand influence
          </div>
          <p className="text-[11px] text-muted-foreground">
            0% = free exploration · 100% = strict BrandKit
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active palette:{" "}
            <span className="font-medium">{paletteName || "None selected"}</span>
          </p>
        </div>
        <div className="min-w-[180px] flex flex-col items-end">
          <input
            type="range"
            min={0}
            max={100}
            value={influence}
            onChange={handleChange}
            className="w-40"
          />
          <span className="text-xs text-muted-foreground mt-1">
            {influence}%
          </span>
        </div>
      </div>
    </div>
  );
};
