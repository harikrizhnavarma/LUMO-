import { FrameShape, ImageRefShape, Shape } from "@/redux/slice/shapes";

export const isShapeInsideFrame = (
  shape: Shape,
  frame: FrameShape
): boolean => {
  const frameLeft = frame.x;
  const frameTop = frame.y;
  const frameRight = frame.x + frame.w;
  const frameBottom = frame.y + frame.h;

  switch (shape.type) {
    case "rect":
    case "ellipse":
    case "imageref":
    case "frame": {
      const centerX = shape.x + shape.w / 2;
      const centerY = shape.y + shape.h / 2;
      return (
        centerX >= frameLeft &&
        centerX <= frameRight &&
        centerY >= frameTop &&
        centerY <= frameBottom
      );
    }

    case "text":
      return (
        shape.x >= frameLeft &&
        shape.x <= frameRight &&
        shape.y >= frameTop &&
        shape.y <= frameBottom
      );

    case "freedraw":
      return shape.points.some(
        (point) =>
          point.x >= frameLeft &&
          point.x <= frameRight &&
          point.y >= frameTop &&
          point.y <= frameBottom
      );

    case "line":
    case "arrow": {
      const startInside =
        shape.startX >= frameLeft &&
        shape.startX <= frameRight &&
        shape.startY >= frameTop &&
        shape.startY <= frameBottom;
      const endInside =
        shape.endX >= frameLeft &&
        shape.endX <= frameRight &&
        shape.endY >= frameTop &&
        shape.endY <= frameBottom;
      return startInside || endInside;
    }

    default:
      return false;
  }
};

export const getShapesInsideFrame = (
  shapes: Shape[],
  frame: FrameShape
): Shape[] => {
  const shapesInFrame = shapes.filter(
    (shape) => shape.id !== frame.id && isShapeInsideFrame(shape, frame)
  );

  console.log(`Frame ${frame.frameNumber} capture:`, {
    totalShapes: shapes.length,
    captured: shapesInFrame.length,
    capturedTypes: shapesInFrame.map((s) => s.type),
  });

  return shapesInFrame;
};

const drawImageRef = async (
  ctx: CanvasRenderingContext2D,
  shape: ImageRefShape,
  frameX: number,
  frameY: number
) => {
  const relativeX = shape.x - frameX;
  const relativeY = shape.y - frameY;

  const fill = shape.fill ?? "rgba(255, 255, 255, 0.12)";
  const stroke =
    shape.stroke && shape.stroke !== "transparent" ? shape.stroke : "#ffffff";

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = shape.strokeWidth || 2;
  ctx.beginPath();
  ctx.roundRect(relativeX, relativeY, shape.w, shape.h, 8);
  ctx.fill();
  ctx.stroke();

  if (!shape.imageDataUrl) return;

  const img = new Image();
  const source = shape.imageDataUrl.startsWith("data:")
    ? shape.imageDataUrl
    : `data:image/*;base64,${shape.imageDataUrl}`;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, relativeX, relativeY, shape.w, shape.h);
      resolve();
    };
    img.onerror = () => reject(new Error("Failed to load image reference"));
    img.src = source;
  });

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(relativeX, relativeY, shape.w, shape.h);
};

const renderShapeOnCanvas = async (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  frameX: number,
  frameY: number
) => {
  ctx.save();

  try {
    switch (shape.type) {
      case "rect":
      case "ellipse":
      case "frame": {
        const relativeX = shape.x - frameX;
        const relativeY = shape.y - frameY;

        const stroke =
          shape.stroke && shape.stroke !== "transparent"
            ? shape.stroke
            : "#ffffff";
        ctx.strokeStyle = stroke;
        ctx.lineWidth = shape.strokeWidth || 2;

        if (shape.type === "rect" || shape.type === "frame") {
          const borderRadius = shape.type === "rect" ? 8 : 0;
          ctx.beginPath();
          ctx.roundRect(relativeX, relativeY, shape.w, shape.h, borderRadius);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.ellipse(
            relativeX + shape.w / 2,
            relativeY + shape.h / 2,
            shape.w / 2,
            shape.h / 2,
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
        break;
      }

      case "text": {
        const textRelativeX = shape.x - frameX;
        const textRelativeY = shape.y - frameY;
        ctx.fillStyle = shape.fill || "#ffffff";
        ctx.font = `${shape.fontSize}px ${
          shape.fontFamily || "Inter, sans-serif"
        }`;
        ctx.textBaseline = "top";
        ctx.fillText(shape.text, textRelativeX, textRelativeY);
        break;
      }

      case "freedraw":
        if (shape.points.length > 1) {
          ctx.strokeStyle = shape.stroke || "#ffffff";
          ctx.lineWidth = shape.strokeWidth || 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          const firstPoint = shape.points[0];
          ctx.moveTo(firstPoint.x - frameX, firstPoint.y - frameY);

          for (let i = 1; i < shape.points.length; i++) {
            const point = shape.points[i];
            ctx.lineTo(point.x - frameX, point.y - frameY);
          }
          ctx.stroke();
        }
        break;

      case "line":
        ctx.strokeStyle = shape.stroke || "#ffffff";
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.beginPath();
        ctx.moveTo(shape.startX - frameX, shape.startY - frameY);
        ctx.lineTo(shape.endX - frameX, shape.endY - frameY);
        ctx.stroke();
        break;

      case "arrow": {
        ctx.strokeStyle = shape.stroke || "#ffffff";
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.beginPath();
        ctx.moveTo(shape.startX - frameX, shape.startY - frameY);
        ctx.lineTo(shape.endX - frameX, shape.endY - frameY);
        ctx.stroke();

        const headLength = 10;
        const angle = Math.atan2(
          shape.endY - shape.startY,
          shape.endX - shape.startX
        );
        ctx.fillStyle = shape.stroke || "#ffffff";
        ctx.beginPath();
        ctx.moveTo(shape.endX - frameX, shape.endY - frameY);
        ctx.lineTo(
          shape.endX - frameX - headLength * Math.cos(angle - Math.PI / 6),
          shape.endY - frameY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          shape.endX - frameX - headLength * Math.cos(angle + Math.PI / 6),
          shape.endY - frameY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        break;
      }

      case "imageref":
        await drawImageRef(ctx, shape as ImageRefShape, frameX, frameY);
        break;
    }
  } finally {
    ctx.restore();
  }
};

export const generateFrameSnapshot = async (
  frame: FrameShape,
  allShapes: Shape[]
): Promise<Blob> => {
  const shapesInFrame = getShapesInsideFrame(allShapes, frame);

  console.log("Creating canvas for frame snapshot");
  const canvas = document.createElement("canvas");
  canvas.width = frame.w;
  canvas.height = frame.h;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.clip();

  await Promise.all(
    shapesInFrame.map((shape) =>
      renderShapeOnCanvas(ctx, shape, frame.x, frame.y)
    )
  );

  ctx.restore();
  console.log("All shapes rendered to snapshot");

  console.log("Converting canvas to blob...");
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log("Blob created successfully:", {
            size: blob.size,
            type: blob.type,
          });
          resolve(blob);
        } else {
          console.error("Failed to create image blob");
          reject(new Error("Failed to create image blob"));
        }
      },
      "image/png",
      1.0
    );
  });
};

const sendFrameToAPI = async (
  frameSnapshot: Blob,
  frameNumber: number
): Promise<Response> => {
  const formData = new FormData();
  formData.append("image", frameSnapshot, `frame-${frameNumber}.png`);
  formData.append("frameNumber", frameNumber.toString());

  let brandInfluence = 75;
  let paletteId: string | null = null;

  if (typeof window !== "undefined") {
    const storedInfluence = window.localStorage.getItem("brandInfluence");
    if (storedInfluence !== null) {
      const parsed = Number(storedInfluence);
      if (!Number.isNaN(parsed)) {
        brandInfluence = Math.min(100, Math.max(0, parsed));
      }
    }

    const storedPaletteId = window.localStorage.getItem("brandPaletteId");
    if (storedPaletteId) {
      paletteId = storedPaletteId;
    }
  }

  formData.append("brandInfluence", String(brandInfluence));
  if (paletteId) {
    formData.append("paletteId", paletteId);
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const captureVisualContent = async (
  ctx: CanvasRenderingContext2D,
  contentDiv: HTMLElement,
  width: number,
  height: number
) => {
  console.log("Capturing visual content from original element");

  const { toPng } = await import("html-to-image");

  const dataUrl = await toPng(contentDiv, {
    width: width,
    height: height,
    backgroundColor: "#ffffff",
    pixelRatio: 1,
    cacheBust: true,
    includeQueryParams: false,
    skipAutoScale: true,
    skipFonts: true,
    filter: (node) => {
      if (node.nodeType === Node.TEXT_NODE) return true;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        return ![
          "SCRIPT",
          "STYLE",
          "BUTTON",
          "INPUT",
          "SELECT",
          "TEXTAREA",
        ].includes(element.tagName);
      }
      return true;
    },
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      console.log("Visual content captured successfully");
      resolve();
    };
    img.onerror = () => {
      reject(new Error("Failed to load captured image"));
    };
    img.src = dataUrl;
  });
};

export const exportGeneratedUIAsPNG = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  console.log("Taking manual snapshot of GeneratedUI element");
  console.log("Element:", element);

  try {
    const rect = element.getBoundingClientRect();
    console.log("Element dimensions:", {
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
    });

    const canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const contentDiv = element.querySelector(
      'div[style*="pointer-events: auto"]'
    ) as HTMLElement | null;

    if (contentDiv) {
      console.log("Found content div, capturing visual content");
      await captureVisualContent(ctx, contentDiv, rect.width, rect.height);
    } else {
      throw new Error("No content div found for export");
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log("GeneratedUI snapshot created successfully:", {
            size: blob.size,
            type: blob.type,
            filename,
          });
          downloadBlob(blob, filename);
        } else {
          console.error("Failed to create GeneratedUI snapshot blob");
        }
      },
      "image/png",
      1.0
    );
  } catch (error) {
    console.error("Failed to capture GeneratedUI snapshot:", error);
    const { toast } = await import("sonner");
    toast.error("Failed to export design. Please try again.");
    throw error;
  }
};
