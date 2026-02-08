import {
  createSlice,
  createEntityAdapter,
  nanoid,
  PayloadAction,
  EntityState,
} from "@reduxjs/toolkit";
import type { Point } from "../viewport";
import type { BrandConsistencyMetrics } from "@/types/brandKit";

export type Tool =
  | "select"
  | "frame"
  | "rect"
  | "ellipse"
  | "freedraw"
  | "arrow"
  | "line"
  | "imageref"
  | "text"
  | "eraser";

export type ShapeType =
  | "frame"
  | "rect"
  | "ellipse"
  | "freedraw"
  | "arrow"
  | "line"
  | "imageref"
  | "text"
  | "generatedui";

export interface BaseShape {
  id: string;
  type: ShapeType;
  stroke: string;
  strokeWidth: number;
  fill?: string | null;
}

export interface FrameShape extends BaseShape {
  type: "frame";
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
}

export interface RectShape extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FreeDrawShape extends BaseShape {
  type: "freedraw";
  points: Point[];
}

export interface ArrowShape extends BaseShape {
  type: "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface LineShape extends BaseShape {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextShape extends BaseShape {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface ImageRefShape extends BaseShape {
  type: "imageref";
  x: number;
  y: number;
  w: number;
  h: number;
  imageDataUrl?: string | null;
  fileName?: string | null;
}

export interface GeneratedUIShape extends BaseShape {
  type: "generatedui";
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;
  sourceFrameId: string;
  isWorkflowPage?: boolean;

  // BrandKit analytics attached to this generated UI
  brandMetrics?: BrandConsistencyMetrics;
}

export type Shape =
  | FrameShape
  | RectShape
  | EllipseShape
  | FreeDrawShape
  | ArrowShape
  | LineShape
  | ImageRefShape
  | TextShape
  | GeneratedUIShape;

// 👇 key change: explicitly tell the adapter that IDs are string
const shapesAdapter = createEntityAdapter<Shape, string>({
  selectId: (s) => s.id,
});

type SelectionMap = Record<string, boolean>;

interface ShapesSnapshot {
  shapes: EntityState<Shape, string>;
  selected: SelectionMap;
  frameCounter: number;
}

interface ShapesState {
  tool: Tool;
  shapes: EntityState<Shape, string>;
  selected: SelectionMap;
  frameCounter: number;
  past: ShapesSnapshot[];
  future: ShapesSnapshot[];
}

const initialState: ShapesState = {
  tool: "select",
  shapes: shapesAdapter.getInitialState(),
  selected: {},
  frameCounter: 0,
  past: [],
  future: [],
};

const DEFAULTS = { stroke: "var(--canvas-stroke)", strokeWidth: 2 as const };

// ---------- shape factories ----------

const makeFrame = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FrameShape => ({
  id: nanoid(),
  type: "frame",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  frameNumber: p.frameNumber,
  stroke: p.stroke ?? "transparent",
  strokeWidth: p.strokeWidth ?? 0,
  fill: p.fill ?? "rgba(255, 255, 255, 0.05)",
});

const makeRect = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): RectShape => ({
  id: nanoid(),
  type: "rect",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeEllipse = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): EllipseShape => ({
  id: nanoid(),
  type: "ellipse",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeFree = (p: {
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FreeDrawShape => ({
  id: nanoid(),
  type: "freedraw",
  points: p.points,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeArrow = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): ArrowShape => ({
  id: nanoid(),
  type: "arrow",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeLine = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): LineShape => ({
  id: nanoid(),
  type: "line",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

const makeText = (p: {
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  fill?: string | null;
}): TextShape => ({
  id: nanoid(),
  type: "text",
  x: p.x,
  y: p.y,
  text: p.text ?? "Text",
  fontSize: p.fontSize ?? 16,
  fontFamily: p.fontFamily ?? "Inter",
  fontWeight: p.fontWeight ?? 400,
  fontStyle: p.fontStyle ?? "normal",
  textAlign: p.textAlign ?? "left",
  textDecoration: p.textDecoration ?? "none",
  lineHeight: p.lineHeight ?? 1.4,
  letterSpacing: p.letterSpacing ?? 0,
  textTransform: p.textTransform ?? "none",
  stroke: "transparent",
  strokeWidth: 0,
  fill: p.fill ?? null,
});

const makeGeneratedUI = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;
  sourceFrameId: string;
  id?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  isWorkflowPage?: boolean;
  brandMetrics?: BrandConsistencyMetrics;
}): GeneratedUIShape => ({
  id: p.id ?? nanoid(),
  type: "generatedui",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  uiSpecData: p.uiSpecData,
  sourceFrameId: p.sourceFrameId,
  isWorkflowPage: p.isWorkflowPage,
  stroke: "transparent",
  strokeWidth: 0,
  fill: p.fill ?? null,
  brandMetrics: p.brandMetrics,
});

const makeImageRef = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  imageDataUrl?: string | null;
  fileName?: string | null;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): ImageRefShape => ({
  id: nanoid(),
  type: "imageref",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  imageDataUrl: p.imageDataUrl ?? null,
  fileName: p.fileName ?? null,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? "rgba(255, 255, 255, 0.5)",
});

// ---------- undo / redo helpers ----------

const cloneSnapshot = (state: ShapesState): ShapesSnapshot => ({
  shapes: {
    ids: [...(state.shapes.ids as string[])],
    entities: Object.fromEntries(
      Object.entries(state.shapes.entities).map(([id, shape]) => [
        id,
        shape ? { ...shape } : shape,
      ])
    ) as EntityState<Shape, string>["entities"],
  },
  selected: { ...state.selected },
  frameCounter: state.frameCounter,
});

const MAX_HISTORY = 50;

const pushToPast = (state: ShapesState) => {
  const snapshot = cloneSnapshot(state);
  state.past.push(snapshot);
  if (state.past.length > MAX_HISTORY) {
    state.past.shift();
  }
  state.future = [];
};

// ---------- slice ----------

const shapesSlice = createSlice({
  name: "shapes",
  initialState,
  reducers: {
    setTool(state, action: PayloadAction<Tool>) {
      state.tool = action.payload;
      if (action.payload !== "select") {
        state.selected = {};
      }
    },

    addFrame(
      state,
      action: PayloadAction<
        Omit<Parameters<typeof makeFrame>[0], "frameNumber">
      >
    ) {
      pushToPast(state);
      state.frameCounter += 1;
      const frameWithNumber = {
        ...action.payload,
        frameNumber: state.frameCounter,
      };
      shapesAdapter.addOne(state.shapes, makeFrame(frameWithNumber));
    },

    addRect(state, action: PayloadAction<Parameters<typeof makeRect>[0]>) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeRect(action.payload));
    },

    addEllipse(
      state,
      action: PayloadAction<Parameters<typeof makeEllipse>[0]>
    ) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeEllipse(action.payload));
    },

    addFreeDrawShape(
      state,
      action: PayloadAction<Parameters<typeof makeFree>[0]>
    ) {
      const { points } = action.payload;
      if (!points || points.length === 0) return;
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeFree(action.payload));
    },

    addArrow(state, action: PayloadAction<Parameters<typeof makeArrow>[0]>) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeArrow(action.payload));
    },

    addLine(state, action: PayloadAction<Parameters<typeof makeLine>[0]>) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeLine(action.payload));
    },

    addText(state, action: PayloadAction<Parameters<typeof makeText>[0]>) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeText(action.payload));
    },

    addImageRef(
      state,
      action: PayloadAction<Parameters<typeof makeImageRef>[0]>
    ) {
      const currentImageRefs = (state.shapes.ids as string[]).filter((id) => {
        const shape = state.shapes.entities[id];
        return shape?.type === "imageref";
      }).length;
      if (currentImageRefs >= 5) return;

      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeImageRef(action.payload));
    },

    addGeneratedUI(
      state,
      action: PayloadAction<Parameters<typeof makeGeneratedUI>[0]>
    ) {
      pushToPast(state);
      shapesAdapter.addOne(state.shapes, makeGeneratedUI(action.payload));
    },

    updateShape(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Shape> }>
    ) {
      const { id, patch } = action.payload;
      const existing = state.shapes.entities[id];
      if (!existing) return;
      pushToPast(state);
      const updated: Shape = { ...existing, ...patch } as Shape;
      shapesAdapter.updateOne(state.shapes, {
        id,
        changes: updated,
      });
    },

    removeShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.shapes.entities[id]) return;
      pushToPast(state);
      shapesAdapter.removeOne(state.shapes, id);
      if (state.selected[id]) {
        const { [id]: _, ...rest } = state.selected;
        state.selected = rest;
      }
    },

    clearAll(state) {
      pushToPast(state);
      state.shapes = shapesAdapter.getInitialState();
      state.selected = {};
      state.frameCounter = 0;
    },

    selectShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.shapes.entities[id]) {
        state.selected = { [id]: true };
      }
    },

    deselectShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selected[id]) {
        const { [id]: _, ...rest } = state.selected;
        state.selected = rest;
      }
    },

    clearSelection(state) {
      state.selected = {};
    },

    selectAll(state) {
      const allIds = state.shapes.ids as string[];
      const selection: SelectionMap = {};
      for (const id of allIds) selection[id] = true;
      state.selected = selection;
    },

    deleteSelected(state) {
      const ids = Object.keys(state.selected);
      if (ids.length === 0) return;
      pushToPast(state);
      shapesAdapter.removeMany(state.shapes, ids);
      state.selected = {};
    },

    loadProject(
      state,
      action: PayloadAction<{
        shapes: EntityState<Shape, string>;
        frameCounter: number;
      }>
    ) {
      state.shapes = action.payload.shapes;
      state.frameCounter = action.payload.frameCounter;
      state.selected = {};
      state.past = [];
      state.future = [];
    },

    undo(state) {
      const prev = state.past.pop();
      if (!prev) return;
      const snapshot = cloneSnapshot(state);
      state.future.push(snapshot);
      state.shapes = prev.shapes;
      state.selected = prev.selected;
      state.frameCounter = prev.frameCounter;
    },

    redo(state) {
      const next = state.future.pop();
      if (!next) return;
      const snapshot = cloneSnapshot(state);
      state.past.push(snapshot);
      state.shapes = next.shapes;
      state.selected = next.selected;
      state.frameCounter = next.frameCounter;
    },
  },
});

export const {
  setTool,
  addFrame,
  addRect,
  addEllipse,
  addFreeDrawShape,
  addArrow,
  addLine,
  addText,
  addImageRef,
  addGeneratedUI,
  updateShape,
  removeShape,
  clearAll,
  selectShape,
  deselectShape,
  clearSelection,
  selectAll,
  deleteSelected,
  loadProject,
  undo,
  redo,
} = shapesSlice.actions;

export default shapesSlice.reducer;

export const shapesSelectors = shapesAdapter.getSelectors<{
  shapes: ShapesState;
}>((state) => state.shapes.shapes);

export const selectedShapesSelector = (state: { shapes: ShapesState }) =>
  state.shapes.selected;
