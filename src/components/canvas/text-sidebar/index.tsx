/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { updateShape, type TextShape } from "@/redux/slice/shapes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline, Strikethrough, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextSidebarProps {
  isOpen: boolean;
}

export const TextSidebar = ({ isOpen }: TextSidebarProps) => {
  const dispatch = useAppDispatch();
  const selectedShapes = useAppSelector((state) => state.shapes.selected);
  const shapesEntities = useAppSelector(
    (state) => state.shapes.shapes.entities
  );

  // Get the first selected text shape
  const selectedTextShape = Object.keys(selectedShapes)
    .map((id) => shapesEntities[id])
    .find((shape) => shape?.type === "text") as TextShape | undefined;

  const [colorInput, setColorInput] = useState(
    selectedTextShape?.fill || "#ffffff"
  );

  if (!isOpen || !selectedTextShape) return null;

  // Font families available in the system
  const fontFamilies = [
    "Inter, sans-serif",
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Monaco, monospace",
    "system-ui, sans-serif",
  ];

  // Helper function to update text properties
  const updateTextProperty = (property: keyof TextShape, value: any) => {
    if (!selectedTextShape) return;

    dispatch(
      updateShape({
        id: selectedTextShape.id,
        patch: { [property]: value },
      })
    );
  };

  // Handle color change with validation
  const handleColorChange = (color: string) => {
    setColorInput(color);
    if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
      updateTextProperty("fill", color);
    }
  };

  return (
  <div
    className={cn(
      "fixed right-5 top-1/2 -translate-y-1/2 w-80 " +
      "backdrop-blur-xl " +
      "bg-[var(--canvas-panel-strong)] " +
      "border border-[var(--canvas-panel-border)] " +
      "shadow-md dark:shadow-none " +
      "rounded-xl p-3 gap-2 " +
      "text-[var(--canvas-panel-text)] " +
      "saturate-150 " +
      "z-[70] " + // ⬅️ higher than bottom bar z-50
      "transition-transform duration-300",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}
  >
    <div className="p-4 flex flex-col gap-10 overflow-y-auto max-h-[calc(100vh-8rem)]">
      {/* Font family */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Font Family
        </Label>
        <Select
          value={selectedTextShape.fontFamily}
          onValueChange={(value) => updateTextProperty("fontFamily", value)}
        >
          <SelectTrigger
            className="
              z-[80]
              w-full
              bg-[var(--canvas-panel-strong)]
              border border-[var(--canvas-panel-border)]
              text-[var(--canvas-panel-text)]
              rounded-lg
            "
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="
              z-[80]
              bg-[var(--canvas-panel-strong)]
              border border-[var(--canvas-panel-border)]
              text-[var(--canvas-panel-text)]
            "
          >
            {fontFamilies.map((font) => (
              <SelectItem
                key={font}
                value={font}
                className="
                  text-[var(--canvas-panel-text)]
                  hover:bg-[var(--canvas-panel-hover)]
                "
              >
                <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
              </SelectItem>
            ))}
</SelectContent>

        </Select>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Font Size: {selectedTextShape.fontSize}px
        </Label>
        <Slider
          value={[selectedTextShape.fontSize]}
          onValueChange={([value]) => updateTextProperty("fontSize", value)}
          min={8}
          max={128}
          step={1}
          className="w-full"
        />
      </div>

      {/* Font weight */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Font Weight: {selectedTextShape.fontWeight}
        </Label>
        <Slider
          value={[selectedTextShape.fontWeight]}
          onValueChange={([value]) => updateTextProperty("fontWeight", value)}
          min={100}
          max={900}
          step={100}
          className="w-full"
        />
      </div>

      {/* Style toggles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Style
        </Label>
        <div className="flex gap-2">
          <Toggle
            pressed={selectedTextShape.fontWeight >= 600}
            onPressedChange={(pressed) =>
              updateTextProperty("fontWeight", pressed ? 700 : 400)
            }
            className="
              border border-[var(--canvas-panel-border)]
              bg-[var(--canvas-panel-strong)]
              text-[var(--canvas-panel-text)]
              data-[state=on]:bg-[var(--canvas-panel-text)]
              data-[state=on]:text-[var(--canvas-bg)]
            "
          >
            <Bold className="w-4 h-4" />
          </Toggle>

          <Toggle
            pressed={selectedTextShape.fontStyle === "italic"}
            onPressedChange={(pressed) =>
              updateTextProperty("fontStyle", pressed ? "italic" : "normal")
            }
            className="
              border border-[var(--canvas-panel-border)]
              bg-[var(--canvas-panel-strong)]
              text-[var(--canvas-panel-text)]
              data-[state=on]:bg-[var(--canvas-panel-text)]
              data-[state=on]:text-[var(--canvas-bg)]
            "
          >
            <Italic className="w-4 h-4" />
          </Toggle>

          <Toggle
            pressed={selectedTextShape.textDecoration === "underline"}
            onPressedChange={(pressed) =>
              updateTextProperty(
                "textDecoration",
                pressed ? "underline" : "none"
              )
            }
            className="
              border border-[var(--canvas-panel-border)]
              bg-[var(--canvas-panel-strong)]
              text-[var(--canvas-panel-text)]
              data-[state=on]:bg-[var(--canvas-panel-text)]
              data-[state=on]:text-[var(--canvas-bg)]
            "
          >
            <Underline className="w-4 h-4" />
          </Toggle>

          <Toggle
            pressed={selectedTextShape.textDecoration === "line-through"}
            onPressedChange={(pressed) =>
              updateTextProperty(
                "textDecoration",
                pressed ? "line-through" : "none"
              )
            }
            className="
              border border-[var(--canvas-panel-border)]
              bg-[var(--canvas-panel-strong)]
              text-[var(--canvas-panel-text)]
              data-[state=on]:bg-[var(--canvas-panel-text)]
              data-[state=on]:text-[var(--canvas-bg)]
            "
          >
            <Strikethrough className="w-4 h-4" />
          </Toggle>
        </div>
      </div>

      {/* Line height */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Line Height: {selectedTextShape.lineHeight}
        </Label>
        <Slider
          value={[selectedTextShape.lineHeight]}
          onValueChange={([value]) => updateTextProperty("lineHeight", value)}
          min={0.8}
          max={3}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Letter spacing */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)]">
          Letter Spacing: {selectedTextShape.letterSpacing}px
        </Label>
        <Slider
          value={[selectedTextShape.letterSpacing]}
          onValueChange={([value]) =>
            updateTextProperty("letterSpacing", value)
          }
          min={-2}
          max={10}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Text color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--canvas-panel-muted)] flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Text Color
        </Label>
        <div className="flex gap-2">
          <Input
            value={colorInput}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#111111"
            className="
              flex-1
              bg-[var(--canvas-panel-strong)]
              border border-[var(--canvas-panel-border)]
              text-[var(--canvas-panel-text)]
              placeholder:text-[var(--canvas-panel-muted)]
            "
          />
          <div
            className="
              w-10 h-10 rounded
              border border-[var(--canvas-panel-border)]
              cursor-pointer
            "
            style={{ backgroundColor: selectedTextShape.fill || "#111111" }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "color";
              input.value = selectedTextShape.fill || "#111111";
              input.onchange = (e) => {
                const color = (e.target as HTMLInputElement).value;
                setColorInput(color);
                updateTextProperty("fill", color);
              };
              input.click();
            }}
          />
        </div>
      </div>
    </div>
  </div>
)
};
