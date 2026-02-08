"use client";

import React from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { undo, redo } from "@/redux/slice/shapes";

export const HistoryPill = () => {
  const dispatch = useAppDispatch();

  const pastLength =
    useAppSelector((state) => (state as any).shapes.past?.length ?? 0);
  const futureLength =
    useAppSelector((state) => (state as any).shapes.future?.length ?? 0);

  const canUndo = pastLength > 0;
  const canRedo = futureLength > 0;

  return (
    <div className="col-span-1 flex justify-start items-center">
      <div
        className="
        inline-flex items-center 
        rounded-md p-2
        backdrop-blur-xl
        bg-[var(--canvas-panel)]
        border border-[var(--canvas-panel-border)]
        text-[var(--canvas-panel-text)]
        transition
      "
      >
        {/* Undo */}
        <button
          type="button"
          onClick={() => canUndo && dispatch(undo())}
          disabled={!canUndo}
          className="
            inline-grid h-9 w-9 place-items-center
            rounded-md 
            hover:bg-[var(--canvas-panel-hover-strong)]
            transition-all cursor-pointer
            disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default
          "
          aria-label="Undo"
        >
          <Undo2
            size={18}
            className="stroke-[1.75] text-[var(--canvas-panel-text)]"
          />
        </button>

        {/* Separator */}
        <span className="mx-1 h-5 w-px rounded bg-[var(--canvas-panel-border)]" />

        {/* Redo */}
        <button
          type="button"
          onClick={() => canRedo && dispatch(redo())}
          disabled={!canRedo}
          className="
            inline-grid h-9 w-9 place-items-center
            rounded-md 
            hover:bg-[var(--canvas-panel-hover-strong)]
            transition-all cursor-pointer
            disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default
          "
          aria-label="Redo"
        >
          <Redo2
            size={18}
            className="stroke-[1.75] text-[var(--canvas-panel-text)]"
          />
        </button>
      </div>
    </div>
  );
};
