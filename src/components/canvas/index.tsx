"use client";

import { useInfiniteCanvas, useInspiration } from "@/hooks/use-canvas";
import { cn } from "@/lib/utils";
import { ShapeRenderer } from "./shapes";
import { FramePreview } from "./shapes/frame/preview";
import { RectanglePreview } from "./shapes/rectangle/preview";
import { ImageRefPreview } from "./shapes/imageref/preview";
import { ElipsePreview } from "./shapes/elipse/preview";
import { FreeDrawStrokePreview } from "./shapes/stroke/preview";
import { ArrowPreview } from "./shapes/arrow/preview";
import { LinePreview } from "./shapes/line/preview";

import { SelectionOverlay } from "./shapes/selection";
import { TextSidebar } from "./text-sidebar";
import { InspirationSidebar } from "./shapes/inspiration-sidebar";

export const InfiniteCanvas = ({
  toggleChat,
  generateWorkflow,
  exportDesign,
}: {
  toggleChat: (generatedUIId: string) => void;
  generateWorkflow: (generatedUIId: string) => void;
  exportDesign: (generatedUIId: string, element: HTMLElement | null) => void;
}) => {
  const {
    viewport,
    shapes,
    currentTool,
    selectedShapes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    attachCanvasRef,
    getDraftShape,
    getFreeDrawPoints,
    isSidebarOpen,
    hasSelectedText,
  } = useInfiniteCanvas();

  const { isInspirationOpen, closeInspiration, toggleInspiration } =
    useInspiration();

  const draftShape = getDraftShape();
  const freeDrawPoints = getFreeDrawPoints();
  const renderShapes = shapes.filter((shape) => shape.type !== "generatedui");

  return (
    <>
      <TextSidebar isOpen={isSidebarOpen && hasSelectedText} />

      <InspirationSidebar
        isOpen={isInspirationOpen}
        onClose={closeInspiration}
      />

      <div
        ref={attachCanvasRef}
        role="application"
        aria-label="Infinite drawing canvas"
        className={cn(
          `
          relative w-full h-full overflow-hidden select-none z-0

          /* ⭐ THEME-AWARE CANVAS BACKGROUND */
          bg-transparent
          `,
          {
            "cursor-grabbing": viewport.mode === "panning",
            "cursor-grab": viewport.mode === "shiftPanning",
            "cursor-crosshair":
              currentTool !== "select" && viewport.mode === "idle",
            "cursor-default":
              currentTool === "select" && viewport.mode === "idle",
          }
        )}
        style={{
          touchAction: "none",
          backgroundSize: `${28 * viewport.scale}px ${28 * viewport.scale}px`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        <div
          className="absolute origin-top-left pointer-events-none z-10"
          style={{
            transform: `translate3d(${viewport.translate.x}px, ${viewport.translate.y}px, 0) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {renderShapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              toggleInspiration={toggleInspiration}
              toggleChat={toggleChat}
              generateWorkflow={generateWorkflow}
              exportDesign={exportDesign}
            />
          ))}

          {/* Selection overlays */}
          {renderShapes.map((shape) => (
            <SelectionOverlay
              key={`selection-${shape.id}`}
              shape={shape}
              isSelected={!!selectedShapes[shape.id]}
            />
          ))}

          {/* Draft previews */}
          {draftShape && draftShape.type === "frame" && (
            <FramePreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {draftShape && draftShape.type === "rect" && (
            <RectanglePreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {draftShape && draftShape.type === "imageref" && (
            <ImageRefPreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {draftShape && draftShape.type === "ellipse" && (
            <ElipsePreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {draftShape && draftShape.type === "arrow" && (
            <ArrowPreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {draftShape && draftShape.type === "line" && (
            <LinePreview
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {currentTool === "freedraw" && freeDrawPoints.length > 1 && (
            <FreeDrawStrokePreview points={freeDrawPoints} />
          )}
        </div>
      </div>
    </>
  );
};
