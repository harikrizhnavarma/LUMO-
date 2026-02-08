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
    <div className="pointer-events-auto">
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={100}
          value={influence}
          onChange={handleChange}
          aria-label="Brand influence"
          style={{ ["--brand-influence" as any]: `${influence}%` }}
          className="brand-influence-slider w-52"
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[var(--canvas-panel-text)] pointer-events-none">
          Brand influence
        </span>
      </div>
    </div>
  );
};
