"use client";

import React, { useState, useRef, useEffect } from "react";
import { TextShape, updateShape, removeShape } from "@/redux/slice/shapes";
import { useDispatch } from "react-redux";

export const Text = ({ shape }: { shape: TextShape }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(shape.text === "Text");
  const [tempText, setTempText] = useState(shape.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔑 THEME-AWARE TEXT COLOR
  // If fill is empty or pure white, fall back to var(--canvas-stroke)
  const effectiveColor =
    !shape.fill ||
    shape.fill === "#ffffff" ||
    shape.fill === "#fff" ||
    shape.fill.toLowerCase?.() === "white"
      ? "var(--canvas-stroke)"
      : shape.fill;

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
