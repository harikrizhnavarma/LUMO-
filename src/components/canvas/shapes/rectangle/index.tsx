import { RectShape } from "@/redux/slice/shapes";

export const Rectangle = ({ shape }: { shape: RectShape }) => {
  
  const stroke =
  !shape.stroke || shape.stroke === "#ffffff" || shape.stroke === "#fff"
    ? "var(--canvas-stroke)"
    : shape.stroke;
  const fill = shape.fill || "transparent";

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.h,
        borderColor: stroke,
        borderWidth: shape.strokeWidth,
        borderStyle: "solid",
        backgroundColor: fill,
        borderRadius: "8px",
      }}
    />
  );
};
