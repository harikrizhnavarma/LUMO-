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
        rounded-full p-2
        backdrop-blur-xl
        bg-neutral-200/70 dark:bg-white/10
        border border-neutral-300 dark:border-white/20
        text-neutral-700 dark:text-white
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
            rounded-full 
            hover:bg-neutral-300 dark:hover:bg-white/20
            transition-all cursor-pointer
            disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default
          "
          aria-label="Undo"
        >
          <Undo2
            size={18}
            className="stroke-[1.75] text-neutral-700 dark:text-white"
          />
        </button>

        {/* Separator */}
        <span className="mx-1 h-5 w-px rounded bg-neutral-400 dark:bg-white/20" />

        {/* Redo */}
        <button
          type="button"
          onClick={() => canRedo && dispatch(redo())}
          disabled={!canRedo}
          className="
            inline-grid h-9 w-9 place-items-center
            rounded-full 
            hover:bg-neutral-300 dark:hover:bg-white/20
            transition-all cursor-pointer
            disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default
          "
          aria-label="Redo"
        >
          <Redo2
            size={18}
            className="stroke-[1.75] text-neutral-700 dark:text-white"
          />
        </button>
      </div>
    </div>
  );
};
