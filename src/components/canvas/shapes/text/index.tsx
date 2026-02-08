"use client";

import React, { useState, useRef, useEffect } from "react";
import { TextShape, updateShape, removeShape } from "@/redux/slice/shapes";
import { useDispatch } from "react-redux";

export const Text = ({ shape }: { shape: TextShape }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(shape.text === "Text");
  const [tempText, setTempText] = useState(shape.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseColor = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) {
      const hex = trimmed.replace("#", "");
      const normalized =
        hex.length === 3
          ? hex
              .split("")
              .map((ch) => `${ch}${ch}`)
              .join("")
          : hex;
      if (normalized.length !== 6) return null;
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return { r, g, b };
    }
    const rgbMatch = trimmed.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/
    );
    if (!rgbMatch) return null;
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  };

  const luminance = (rgb: { r: number; g: number; b: number }) => {
    const transform = (c: number) => {
      const srgb = c / 255;
      return srgb <= 0.03928
        ? srgb / 12.92
        : Math.pow((srgb + 0.055) / 1.055, 2.4);
    };
    const r = transform(rgb.r);
    const g = transform(rgb.g);
    const b = transform(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getCanvasBackground = () => {
    if (typeof window === "undefined") return null;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--canvas-bg")
      .trim();
    return value || null;
  };

  // dY"` THEME-AWARE TEXT COLOR
  // If fill is empty or near-colliding with the canvas background, fall back to theme text.
  const rawFill = shape.fill?.toString().trim() ?? "";
  const lowerFill = rawFill.toLowerCase();
  const defaultColor = "var(--canvas-panel-text)";
  let effectiveColor = rawFill || defaultColor;

  if (!rawFill || lowerFill === "transparent") {
    effectiveColor = defaultColor;
  } else if (
    lowerFill === "#ffffff" ||
    lowerFill === "#fff" ||
    lowerFill === "white" ||
    lowerFill === "#000000" ||
    lowerFill === "#000" ||
    lowerFill === "black"
  ) {
    effectiveColor = defaultColor;
  } else {
    const fillRgb = parseColor(rawFill);
    const bgValue = getCanvasBackground();
    const bgRgb = bgValue ? parseColor(bgValue) : null;
    if (fillRgb && bgRgb) {
      const ratio =
        (Math.max(luminance(fillRgb), luminance(bgRgb)) + 0.05) /
        (Math.min(luminance(fillRgb), luminance(bgRgb)) + 0.05);
      if (ratio < 2.6) {
        effectiveColor = defaultColor;
      }
    }
  }
  // Auto-focus when text is newly created (placeholder text)
  useEffect(() => {
    if (shape.text === "Text" && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setIsEditing(true);
    }
  }, [shape.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (shape.text === "Text") {
        inputRef.current.select();
      }
    }
  }, [isEditing, shape.text]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempText(shape.text);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = tempText.trim();

    // If user leaves it empty or keeps placeholder, remove shape
    if (trimmed === "" || trimmed === "Text") {
      dispatch(removeShape(shape.id));
      return;
    }

    // If text actually changed, update shape (your reducer expects `patch`)
    if (trimmed !== shape.text) {
      dispatch(
        updateShape({
          id: shape.id,
          patch: { text: trimmed },
        })
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      if (shape.text === "Text") {
        dispatch(removeShape(shape.id));
      } else {
        setIsEditing(false);
        setTempText(shape.text);
      }
    }
  };

  // Shared base style — this is what your canvas uses for positioning
  const baseStyle: React.CSSProperties = {
    left: shape.x,
    top: shape.y,
    fontSize: shape.fontSize,
    fontFamily: shape.fontFamily,
    fontWeight: shape.fontWeight,
    fontStyle: shape.fontStyle,
    textAlign: shape.textAlign,
    textDecoration: shape.textDecoration,
    lineHeight: shape.lineHeight,
    letterSpacing: shape.letterSpacing,
    textTransform: shape.textTransform,
    color: effectiveColor ?? "var(--canvas-stroke)",
    whiteSpace: "nowrap",
    position: "absolute",
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="type"
        // 🧷 Important: keep pointer events here so user can type,
        // but stop them from bubbling to canvas drag logic.
        onPointerDown={(e) => e.stopPropagation()}
        className="
          bg-transparent outline-none 
          rounded px-2 py-1
        "
        style={{
          ...baseStyle,
          minWidth: "100px",
        }}
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        data-shape-id={shape.id}
      />
    );
  }

  return (
    <div
      // ✅ This must be interactive so the canvas can detect/drag/select the text shape
      data-shape-id={shape.id}
      className="cursor-text select-none rounded px-2 py-1"
      style={{
        ...baseStyle,
        userSelect: "none",
      }}
      onDoubleClick={handleDoubleClick}
      // Let pointer events bubble so the canvas hit-test / drag logic still works
    >
      <span
        className="pointer-events-auto"
        style={{ display: "block", minWidth: "20px", minHeight: "1em" }}
      >
        {shape.text}
      </span>
    </div>
  );
};
