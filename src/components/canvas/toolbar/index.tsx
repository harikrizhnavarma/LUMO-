"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { ToolBarShapes } from "./shapes";
import { HistoryPill } from "./history";
import { ZoomBar } from "./zoom";

export const Toolbar = ({ isVisible = true }: { isVisible?: boolean }) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const projectId = params.get("project");
  const profileState = useAppSelector((state) => (state as any).profile);
  const me = (profileState?.user ?? profileState) as any;
  const styleGuideHref =
    projectId && me?.name
      ? `/dashboard/${me.name}/style-guide?project=${projectId}`
      : null;
  const isStyleGuideActive = pathname.includes("/style-guide");

  return (
    <div
      className={[
        "fixed bottom-0 w-full grid grid-cols-3 z-50 p-5",
        "backdrop-blur-xl bg-transparent",
        "border-t border-transparent",
        "transition-opacity duration-300 ease-in-out will-change-[opacity]",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <HistoryPill />
      <div className="col-span-1 flex items-center justify-center gap-3 flex-nowrap">
        <ToolBarShapes className="w-[38rem] max-w-[70vw] flex-none justify-between overflow-hidden" />
        {styleGuideHref && (
          <Link
            href={styleGuideHref}
            className={[
              "h-12 px-5 rounded-md border text-xs font-semibold uppercase tracking-[0.16em] transition shadow-sm backdrop-blur-xl flex items-center justify-center flex-none",
              isStyleGuideActive
                ? "border-[var(--canvas-accent)] bg-[var(--canvas-accent)] text-white dark:text-black shadow-[0_12px_30px_rgba(255,62,0,0.25)]"
                : "border-[var(--canvas-panel-border)] bg-[var(--canvas-panel-strong)] text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover-strong)] hover:border-[var(--canvas-panel-hover-strong)]",
            ].join(" ")}
          >
            Style Guide
          </Link>
        )}
      </div>
      <ZoomBar />
    </div>
  );
};
