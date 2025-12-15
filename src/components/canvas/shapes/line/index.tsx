import { LineShape } from "@/redux/slice/shapes";

export const Line = ({ shape }: { shape: LineShape }) => {
  const { startX, startY, endX, endY } = shape;

  const minX = Math.min(startX, endX) - 5;
  const minY = Math.min(startY, endY) - 5;
  const maxX = Math.max(startX, endX) + 5;
  const maxY = Math.max(startY, endY) + 5;
  const width = maxX - minX;
  const height = maxY - minY;

  const stroke =
  !shape.stroke || shape.stroke === "#ffffff" || shape.stroke === "#fff"
    ? "var(--canvas-stroke)"
    : shape.stroke;

  return (
    <svg
      className="absolute pointer-events-none z-10"
      style={{
        left: minX,
        top: minY,
        width,
        height,
      }}
      aria-hidden
    >
      <line
        x1={startX - minX}
        y1={startY - minY}
        x2={endX - minX}
        y2={endY - minY}
        stroke={stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
