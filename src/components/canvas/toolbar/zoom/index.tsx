import { Button } from "@/components/ui/button";
import { useInfiniteCanvas } from "@/hooks/use-canvas";
import { setScale } from "@/redux/slice/viewport";
import { ZoomOut, ZoomIn } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";

export const ZoomBar = () => {
  const dispatch = useDispatch();
  const { viewport } = useInfiniteCanvas();

  const [zoomInput, setZoomInput] = React.useState<number | "">(
    Math.round(viewport.scale * 100)
  );

  React.useEffect(() => {
    setZoomInput(Math.round(viewport.scale * 100));
  }, [viewport.scale]);

  const handleZoomIn = () => {
    const newScale = Math.min(viewport.scale * 1.2, viewport.maxScale);
    dispatch(setScale({ scale: newScale }));
  };

  const handleZoomOut = () => {
    const newScale = Math.max(viewport.scale / 1.2, viewport.minScale);
    dispatch(setScale({ scale: newScale }));
  };

  const applyZoom = () => {
    if (zoomInput === "" || typeof zoomInput !== "number" || isNaN(zoomInput)) {
      setZoomInput(Math.round(viewport.scale * 100));
      return;
    }

    let value = zoomInput;

    if (value < 10) value = 10;
    if (value > 500) value = 500;

    dispatch(setScale({ scale: value / 100 }));
  };

  return (
    <div className="col-span-1 flex justify-end items-center">
      <div
        className="
        flex items-center gap-1 
        backdrop-blur-xl 
        bg-[var(--canvas-panel)] 
        border border-[var(--canvas-panel-border)] 
        rounded-md p-3 
        transition
      "
      >
        {/* Zoom Out */}
        <Button
          variant="ghost"
          size="lg"
          onClick={handleZoomOut}
          className="
            w-9 h-9 p-0 rounded-md cursor-pointer 
            hover:bg-[var(--canvas-panel-hover-strong)]
            border border-transparent hover:border-[var(--canvas-panel-border)]
            transition
          "
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-[var(--canvas-panel-text)]" />
        </Button>

        {/* Percentage Input */}
        <div className="flex items-center">
          <input
            type="text"
            className="
              w-14 text-center bg-transparent text-sm font-mono 
              text-[var(--canvas-panel-text)]
              rounded-md outline-none 
              border border-[var(--canvas-panel-border)] 
              hover:border-[var(--canvas-panel-hover-strong)] 
              transition
            "
            value={zoomInput}
            onChange={(e) => {
              const raw = e.target.value.replace("%", "");
              if (/^\d*$/.test(raw))
                setZoomInput(raw === "" ? "" : Number(raw));
            }}
            onBlur={applyZoom}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
          <span className="text-sm font-mono text-[var(--canvas-panel-text)] ml-1">
            %
          </span>
        </div>

        {/* Zoom In */}
        <Button
          variant="ghost"
          size="lg"
          onClick={handleZoomIn}
          className="
            w-9 h-9 p-0 rounded-md cursor-pointer 
            hover:bg-[var(--canvas-panel-hover-strong)]
            border border-transparent hover:border-[var(--canvas-panel-border)]
            transition
          "
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-[var(--canvas-panel-text)]" />
        </Button>
      </div>
    </div>
  );
};
