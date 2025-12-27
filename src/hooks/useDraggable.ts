import { useCallback, useEffect, useRef, useState } from "react";
import type { UseDraggableOptions, UseDraggableReturn } from "../types";
import { clampPosition } from "../utils";

/**
 * useDraggable - ドラッグ/タッチ処理を管理するカスタムフック
 */
export function useDraggable({
  containerRef,
  onPositionChange,
  onDragStart,
  onDragEnd,
  disabled = false,
}: Omit<UseDraggableOptions, "elementRef">): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);
  const dragEndTimeRef = useRef(0);

  // 座標からポジションを計算する共通関数
  const calculatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      return clampPosition({ x, y });
    },
    [containerRef]
  );

  // ドラッグ開始（共通）
  const startDrag = useCallback(() => {
    if (disabled) return false;
    hasDraggedRef.current = false;
    setIsDragging(true);
    onDragStart?.();
    return true;
  }, [disabled, onDragStart]);

  // マウスダウンハンドラ
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (startDrag()) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    [startDrag]
  );

  // タッチスタートハンドラ
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (startDrag()) {
        e.stopPropagation();
      }
    },
    [startDrag]
  );

  // マウス/タッチ移動・終了イベント
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      hasDraggedRef.current = true;
      const position = calculatePosition(clientX, clientY);
      if (position) {
        onPositionChange?.(position);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragEndTimeRef.current = Date.now();
      onDragEnd?.();
    };

    // マウスイベント
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();

    // タッチイベント
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging, calculatePosition, onPositionChange, onDragEnd]);

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    hasDraggedRef,
    dragEndTimeRef,
  };
}
