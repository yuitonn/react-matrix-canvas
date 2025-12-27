import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { AreaProps } from "../types";

/**
 * Area - マトリクスの各エリアを表示するコンポーネント
 */
export function Area({ config, className = "", style, children }: AreaProps) {
  const areaStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: config.backgroundColor ?? "transparent",
      position: "relative",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: "12px",
      ...style,
    }),
    [config.backgroundColor, style]
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      color: config.labelColor ?? "#666",
      fontSize: "14px",
      fontWeight: 500,
      userSelect: "none",
    }),
    [config.labelColor]
  );

  const combinedClassName = useMemo(
    () => ["react-matrix-canvas-area", className].filter(Boolean).join(" "),
    [className]
  );

  return (
    <div
      className={combinedClassName}
      style={areaStyle}
      data-area-id={config.id}
    >
      {children ??
        (config.label && <span style={labelStyle}>{config.label}</span>)}
    </div>
  );
}
