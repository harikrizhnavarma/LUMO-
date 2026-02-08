import { Button } from "@/components/ui/button";
import { useInfiniteCanvas } from "@/hooks/use-canvas";
import { cn } from "@/lib/utils";
import { Tool } from "@/redux/slice/shapes";
import {
  MousePointer2,
  Hash,
  Square,
  Circle,
  Pencil,
  Image as ImageIcon,
  ArrowRight,
  Minus,
  Type,
  Eraser,
} from "lucide-react";
import React from "react";

const tools: Array<{
  id: Tool;
  icon: React.ReactNode;
  label: string;
  description: string;
}> = [
  {
    id: "select",
    icon: <MousePointer2 className="w-4 h-4" />,
    label: "Select",
    description: "Select and move shapes",
  },
  {
    id: "frame",
    icon: <Hash className="w-4 h-4" />,
    label: "Frame",
    description: "Draw frame containers",
  },
  {
    id: "rect",
    icon: <Square className="w-4 h-4" />,
    label: "Rectangle",
    description: "Draw rectangles",
  },
  {
    id: "ellipse",
    icon: <Circle className="w-4 h-4" />,
    label: "Ellipse",
    description: "Draw ellipses and circles",
  },
  {
    id: "imageref",
    icon: <ImageIcon className="w-4 h-4" />,
    label: "Image",
    description: "Place an image reference box",
  },
  {
    id: "freedraw",
    icon: <Pencil className="w-4 h-4" />,
    label: "Free Draw",
    description: "Draw freehand lines",
  },
  {
    id: "arrow",
    icon: <ArrowRight className="w-4 h-4" />,
    label: "Arrow",
    description: "Draw arrows with direction",
  },
  {
    id: "line",
    icon: <Minus className="w-4 h-4" />,
    label: "Line",
    description: "Draw straight lines",
  },
  {
    id: "text",
    icon: <Type className="w-4 h-4" />,
    label: "Text",
    description: "Add text blocks",
  },
  {
    id: "eraser",
    icon: <Eraser className="w-4 h-4" />,
    label: "Eraser",
    description: "Remove shapes",
  },
];

export const ToolBarShapes = ({ className }: { className?: string }) => {
  const { currentTool, selectTool } = useInfiniteCanvas();

  return (
    <div className="col-span-1 flex justify-center items-center">
      <div
        className={cn(
          `
          flex items-center gap-1.5
          backdrop-blur-xl 
          bg-[var(--canvas-panel)]
          border border-[var(--canvas-panel-border)]
          rounded-md p-3
          transition
          `,
          className
        )}
      >
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="lg"
            onClick={() => selectTool(tool.id)}
            className={cn(
              "cursor-pointer rounded-md p-2 transition border",
              currentTool === tool.id
                ? "text-white dark:text-black bg-[var(--canvas-accent)] border-[var(--canvas-accent)]"
                : "text-[var(--canvas-panel-muted)] hover:text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover)] border-transparent"
            )}
            title={`${tool.label} - ${tool.description}`}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};
