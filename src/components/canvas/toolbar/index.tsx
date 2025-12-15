"use client";

import React from "react";
import { ToolBarShapes } from "./shapes";
import { HistoryPill } from "./history";
import { ZoomBar } from "./zoom";

export const Toolbar = () => {
  return (
    <div className="
                    fixed bottom-0 w-full grid grid-cols-3 z-50 p-5
                    backdrop-blur-xl
                    bg-neutral-100/80 dark:bg-black/40
                    border-t border-neutral-300 dark:border-white/10"
    >
      <HistoryPill />
      <ToolBarShapes />
      <ZoomBar />
    </div>
  );
};
