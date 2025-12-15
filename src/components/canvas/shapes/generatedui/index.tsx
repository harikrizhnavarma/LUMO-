"use client";

import { useMemo, useState } from "react";
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
  const { sanitizeHtml, containerRef } = useUpdateContainer(shape);
  const [showCodeActions, setShowCodeActions] = useState(false);

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
      }}
    >
      <div
        className="
          w-full relative rounded-lg
          border border-neutral-300 dark:border-white/20
          bg-white/70 dark:bg-white/5
          backdrop-blur-xl
          shadow-md dark:shadow-none
          p-4
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

        {/* Render generated HTML */}
        {shape.uiSpecData ? (
          <div
            className="pointer-events-auto"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div className="text-center text-neutral-600 dark:text-white/60 p-4 animate-pulse">
            Generating…
          </div>
        )}
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
