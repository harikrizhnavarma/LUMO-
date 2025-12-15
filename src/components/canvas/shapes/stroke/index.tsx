import { polylineBox } from "@/lib/utils";
import { FreeDrawShape } from "@/redux/slice/shapes";

export const Stroke = ({ shape }: { shape: FreeDrawShape }) => {
  const { points, strokeWidth, stroke, fill } = shape;
  if (points.length < 2) return null;

  const { minX, minY, width, height } = polylineBox(points);
  const pad = strokeWidth;

  const dPts = points
    .map((p) => `${p.x - minX + pad},${p.y - minY + pad}`)
    .join(" ");

  const strokeColor =
      !shape.stroke || shape.stroke === "#ffffff" || shape.stroke === "#fff"
        ? "var(--canvas-stroke)"
        : shape.stroke;
  const fillColor = fill ?? "none";

  return (
    <svg
      className="absolute pointer-events-none z-10"
      style={{
        left: minX - pad,
        top: minY - pad,
        width: width + pad * 2,
        height: height + pad * 2,
      }}
      aria-hidden
    >
      <polyline
        points={dPts}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
