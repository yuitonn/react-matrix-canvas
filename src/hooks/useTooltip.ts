import { useCallback, useEffect, useRef, useState } from "react";
import type { UseTooltipOptions, UseTooltipReturn } from "../types";

/**
 * useTooltip - ツールチップの表示/非表示を管理するカスタムフック
 */
export function useTooltip({
  elementRef,
  showDelay = 0,
  hideDelay = 200,
}: UseTooltipOptions): UseTooltipReturn {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    // fixed positionで使用するため、viewportからの相対位置を使用
    setTooltipPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }, [elementRef]);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const clearShowTimeout = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const handleShowTooltip = useCallback(() => {
    clearHideTimeout();

    if (showDelay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        updatePosition();
        setShowTooltip(true);
      }, showDelay);
    } else {
      updatePosition();
      setShowTooltip(true);
    }
  }, [clearHideTimeout, updatePosition, showDelay]);

  const handleHideTooltip = useCallback(() => {
    clearShowTimeout();

    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, hideDelay);
  }, [clearShowTimeout, hideDelay]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      clearShowTimeout();
      clearHideTimeout();
    };
  }, [clearShowTimeout, clearHideTimeout]);

  return {
    showTooltip,
    tooltipPosition,
    handleShowTooltip,
    handleHideTooltip,
  };
}
