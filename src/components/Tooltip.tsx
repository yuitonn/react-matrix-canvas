import type { CSSProperties } from "react";
import { useMemo } from "react";
import { createPortal } from "react-dom";
import type { TooltipProps } from "../types";

/**
 * Tooltip - マーカーホバー時に表示されるツールチップ
 */
export function Tooltip({
  content,
  position,
  visible,
  onMouseEnter,
  onMouseLeave,
  className = "",
  style,
}: TooltipProps) {
  // 早期リターン（Hooksの前に配置してはいけないため、条件付きレンダリングで対応）
  const tooltipStyle = useMemo<CSSProperties>(
    () =>
      visible
        ? {
            position: "fixed",
            left: position.left,
            top: position.top - 8,
            transform: "translate(-50%, -100%)",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            minWidth: "100px",
            maxWidth: "300px",
            ...style,
          }
        : {},
    [visible, position.left, position.top, style]
  );

  const combinedClassName = useMemo(
    () => ["react-matrix-canvas-tooltip", className].filter(Boolean).join(" "),
    [className]
  );

  if (!visible) return null;

  return createPortal(
    <div
      className={combinedClassName}
      style={tooltipStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </div>,
    document.body
  );
}
