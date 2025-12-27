import type { CSSProperties, ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMatrixContext } from "../context/MatrixContext";
import { useDraggable } from "../hooks/useDraggable";
import { useTooltip } from "../hooks/useTooltip";
import type { MarkerProps, Position } from "../types";
import { clampPosition } from "../utils";
import { Tooltip } from "./Tooltip";

const DEFAULT_SIZE = 20;
const DEFAULT_COLOR = "#3b82f6";
const KEYBOARD_STEP = 2; // 矢印キーでの移動量（%）
const DRAG_END_CLICK_THRESHOLD = 150; // ドラッグ終了後のクリック無視時間（ms）

/**
 * Marker - マトリクス上に配置されるドラッグ可能なマーカー
 */
export function Marker<T = unknown>({
  id,
  position: externalPosition,
  areaId: externalAreaId,
  data,
  onPositionChange,
  onAreaChange,
  onDragEnd,
  onClick,
  tooltip,
  renderTooltip,
  children,
  disabled = false,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  hoverScale,
  className = "",
  hoverClassName = "",
  style,
  hoverStyle,
}: MarkerProps<T>) {
  const markerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, getAreaFromPosition, getDefaultPosition, setIsDragging } =
    useMatrixContext();

  // 位置の計算（外部位置優先、なければデフォルト位置）
  const position = useMemo<Position>(() => {
    if (externalPosition) return externalPosition;
    if (externalAreaId) return getDefaultPosition(externalAreaId);
    return { x: 50, y: 50 };
  }, [externalPosition, externalAreaId, getDefaultPosition]);

  // 現在のエリアID
  const currentAreaId = externalAreaId;

  const [isHovered, setIsHovered] = useState(false);

  // 位置変更ハンドラ
  const handlePositionChange = useCallback(
    (newPosition: Position) => {
      const clampedPosition = clampPosition(newPosition);

      onPositionChange?.(clampedPosition);

      // エリア変更チェック
      const newAreaId = getAreaFromPosition(clampedPosition);
      if (newAreaId && newAreaId !== currentAreaId) {
        onAreaChange?.(newAreaId, currentAreaId ?? "");
      }
    },
    [currentAreaId, getAreaFromPosition, onPositionChange, onAreaChange]
  );

  // ドラッグ開始ハンドラ
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, [setIsDragging]);

  // ドラッグ終了ハンドラ
  const handleDragEndInternal = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [setIsDragging, onDragEnd]);

  // ドラッグ処理
  const {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    hasDraggedRef,
    dragEndTimeRef,
  } = useDraggable({
    containerRef: canvasRef,
    onPositionChange: handlePositionChange,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEndInternal,
    disabled,
  });

  // ツールチップ処理
  const { showTooltip, tooltipPosition, handleShowTooltip, handleHideTooltip } =
    useTooltip({
      elementRef: markerRef,
      hideDelay: 200,
    });

  // マウスエンター/リーブハンドラ
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    handleShowTooltip();
  }, [handleShowTooltip]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    handleHideTooltip();
  }, [handleHideTooltip]);

  // クリックハンドラ（ドラッグ終了直後は無視）
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // 実際にドラッグ（移動）が発生した場合はクリックを無視
      if (hasDraggedRef.current) {
        return;
      }
      // ドラッグ終了直後のクリックは無視
      const timeSinceDragEnd = Date.now() - (dragEndTimeRef.current ?? 0);
      if (timeSinceDragEnd < DRAG_END_CLICK_THRESHOLD) {
        return;
      }
      onClick?.();
    },
    [onClick, hasDraggedRef, dragEndTimeRef]
  );

  // キーボードハンドラ
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const keyActions: Record<string, { dx: number; dy: number } | "click"> = {
        ArrowUp: { dx: 0, dy: -KEYBOARD_STEP },
        ArrowDown: { dx: 0, dy: KEYBOARD_STEP },
        ArrowLeft: { dx: -KEYBOARD_STEP, dy: 0 },
        ArrowRight: { dx: KEYBOARD_STEP, dy: 0 },
        Enter: "click",
        " ": "click",
      };

      const action = keyActions[e.key];
      if (!action) return;

      e.preventDefault();

      if (action === "click") {
        onClick?.();
      } else {
        handlePositionChange({
          x: position.x + action.dx,
          y: position.y + action.dy,
        });
      }
    },
    [disabled, position, handlePositionChange, onClick]
  );

  // ツールチップコンテンツの解決
  const tooltipContent = useMemo((): ReactNode => {
    if (!tooltip) return null;
    if (typeof tooltip === "function") {
      return tooltip(data as T);
    }
    return tooltip;
  }, [tooltip, data]);

  // マーカースタイル（メモ化）
  const markerStyle = useMemo<CSSProperties>(() => {
    const scaleTransform =
      isHovered && hoverScale && !isDragging ? `scale(${hoverScale})` : "";

    return {
      position: "absolute",
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: `translate(-50%, -50%) ${scaleTransform}`.trim(),
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      cursor: disabled ? "default" : "move",
      zIndex: isDragging ? 1000 : isHovered ? 50 : 10,
      transition: isDragging ? "none" : "transform 0.3s, box-shadow 0.2s",
      boxShadow: isDragging
        ? "0 4px 12px rgba(0,0,0,0.3)"
        : "0 2px 4px rgba(0,0,0,0.2)",
      ...style,
      ...(isHovered && !isDragging ? hoverStyle : {}),
    };
  }, [
    position,
    size,
    color,
    disabled,
    isDragging,
    isHovered,
    hoverScale,
    style,
    hoverStyle,
  ]);

  const shouldShowTooltip =
    showTooltip && !isDragging && tooltipPosition !== null;

  // className連結（メモ化）
  const combinedClassName = useMemo(() => {
    const classes = ["react-matrix-canvas-marker", className];
    if (isHovered && !isDragging) {
      classes.push(hoverClassName);
    }
    return classes.filter(Boolean).join(" ");
  }, [className, hoverClassName, isHovered, isDragging]);

  const markerElement = (
    <div
      ref={markerRef}
      className={combinedClassName}
      style={markerStyle}
      data-marker-id={id}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Marker ${id}`}
    >
      {children}
    </div>
  );

  // カスタムツールチップレンダリング
  if (renderTooltip && shouldShowTooltip) {
    return (
      <>
        {markerElement}
        {renderTooltip({
          data: data as T,
          position: tooltipPosition,
          onMouseEnter: handleShowTooltip,
          onMouseLeave: handleHideTooltip,
        })}
      </>
    );
  }

  return (
    <>
      {markerElement}
      {tooltipContent && shouldShowTooltip && (
        <Tooltip
          content={tooltipContent}
          position={tooltipPosition}
          visible={true}
          onMouseEnter={handleShowTooltip}
          onMouseLeave={handleHideTooltip}
        />
      )}
    </>
  );
}
