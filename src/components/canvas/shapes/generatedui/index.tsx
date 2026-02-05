"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { GeneratedUIShape } from "@/redux/slice/shapes";
import { useUpdateContainer } from "@/hooks/use-styles";
import { MessageCircle, Workflow, Download, Code2, Copy } from "lucide-react";
import { LiquidGlassButton } from "@/components/buttons/liquid-glass";
import { toast } from "sonner";

// Helper: strip all <script>...</script> tags from HTML
const stripScripts = (html: string) =>
  html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

// Helper: wrap sanitized HTML into a TSX component string
const buildTsxFromHtml = (html: string) => {
  const serialized = JSON.stringify(html); // safely escape quotes/newlines
  return `import React from "react";

export default function GeneratedUI() {
  return (
    <div
      className="generated-ui"
      dangerouslySetInnerHTML={{ __html: ${serialized} }}
    />
  );
}
`;
};

export const GeneratedUI = ({
  shape,
  toggleChat,
  generateWorkflow,
  exportDesign,
}: {
  shape: GeneratedUIShape;
  toggleChat: (generatedUIId: string) => void;
  generateWorkflow: (generatedUIId: string) => void;
  exportDesign: (generatedUIId: string, element: HTMLElement | null) => void;
}) => {
  const { sanitizeHtml, containerRef } = useUpdateContainer(shape, {
    syncHeight: false,
  });
  const [showCodeActions, setShowCodeActions] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentScale, setContentScale] = useState(1);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

  const metrics = shape.brandMetrics;
  const label =
    metrics?.brandAdherenceScore != null
      ? `Brand ${metrics.brandAdherenceScore.toFixed(0)}%`
      : "Generated UI";

  // Build safe HTML: sanitize + remove any <script> tags
  const safeHtml =
    shape.uiSpecData != null
      ? stripScripts(sanitizeHtml(shape.uiSpecData))
      : "";

  const tsxCode = useMemo(
    () => (safeHtml ? buildTsxFromHtml(safeHtml) : ""),
    [safeHtml]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    let rafId = 0;
    const updateScale = () => {
      if (!viewportRef.current || !contentRef.current) return;
      const viewportWidth = viewportRef.current.clientWidth;
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;

      if (!viewportWidth || !contentWidth) return;

      const nextScale = Math.min(1, viewportWidth / contentWidth);
      setContentScale(Number.isFinite(nextScale) ? nextScale : 1);
      setContentSize({
        width: contentWidth,
        height: contentHeight,
      });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [safeHtml, shape.w, shape.h]);

  const handleCopyCode = async () => {
    if (!tsxCode) return;
    try {
      await navigator.clipboard.writeText(tsxCode);
      toast.success("Code copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const handleDownloadCode = () => {
    if (!tsxCode) return;
    const blob = new Blob([tsxCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-ui-${shape.id.slice(0, 8)}.tsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
      }}
    >
      <div
        className="
          w-full h-full relative rounded-xl
          border border-neutral-300/80 dark:border-white/15
          bg-white/80 dark:bg-black/40
          backdrop-blur-xl
          shadow-md dark:shadow-none
          overflow-hidden
        "
      >
        {/* Action buttons */}
        <div className="absolute -top-8 right-0 flex flex-wrap items-center gap-2">
          <div className="relative">
            {showCodeActions && (
              <div className="absolute -top-[calc(100%+3.0rem)] right-0 flex flex-col items-end gap-2">
                <LiquidGlassButton
                  size="sm"
                  variant="subtle"
                  onClick={handleCopyCode}
                  disabled={!tsxCode}
                >
                  <Copy size={12} />
                  Copy code
                </LiquidGlassButton>

                <LiquidGlassButton
                  size="sm"
                  variant="subtle"
                  onClick={handleDownloadCode}
                  disabled={!tsxCode}
                >
                  <Download size={12} />
                  Download code
                </LiquidGlassButton>
              </div>
            )}

            <LiquidGlassButton
              size="sm"
              variant="subtle"
              onClick={() => setShowCodeActions((open) => !open)}
              disabled={!shape.uiSpecData}
            >
              <Code2 size={12} />
              Code
            </LiquidGlassButton>
          </div>

          <LiquidGlassButton
            size="sm"
            variant="subtle"
            onClick={() => exportDesign(shape.id, containerRef.current)}
            disabled={!shape.uiSpecData}
          >
            <Download size={12} />
            Export
          </LiquidGlassButton>

          <LiquidGlassButton
            size="sm"
            variant="subtle"
            onClick={() => generateWorkflow(shape.id)}
          >
            <Workflow size={12} />
            Workflow
          </LiquidGlassButton>

          <LiquidGlassButton
            size="sm"
            variant="subtle"
            onClick={() => toggleChat(shape.id)}
          >
            <MessageCircle size={12} />
            Chat
          </LiquidGlassButton>
        </div>

        <div className="flex h-full flex-col pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
            </div>
            <div className="text-xs text-neutral-500 dark:text-white/60">
              {shape.isWorkflowPage ? "Workflow page" : "Generated page"}
            </div>
          </div>

          {/* Render generated HTML */}
          {shape.uiSpecData ? (
            <div
              ref={viewportRef}
              className="generated-ui-viewport relative flex-1 overflow-auto bg-white dark:bg-black/20"
              style={{ pointerEvents: "auto" }}
            >
              <div
                className="relative"
                style={{
                  width: Math.max(1, contentSize.width * contentScale),
                  height: Math.max(1, contentSize.height * contentScale),
                }}
              >
                <div
                  ref={contentRef}
                  className="origin-top-left"
                  style={{
                    transform: `scale(${contentScale})`,
                  }}
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-600 dark:text-white/60 p-4 animate-pulse">
              Generating…
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div
        className="
          absolute -top-6 left-0 
          text-xs px-2 py-1 rounded
          bg-neutral-200 dark:bg-black/40
          text-neutral-800 dark:text-white
          whitespace-nowrap
        "
      >
        {label}
      </div>
    </div>
  );
};
