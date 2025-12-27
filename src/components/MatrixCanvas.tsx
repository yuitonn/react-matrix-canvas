import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef } from "react";
import {
  MatrixProvider,
  useMatrixContextOptional,
} from "../context/MatrixContext";
import type {
  AreaConfig,
  GridConfig,
  MatrixCanvasProps,
  Position,
} from "../types";
import { clampPosition } from "../utils";
import { Area } from "./Area";

/**
 * MatrixCanvas - マトリクスキャンバスのメインコンポーネント
 */
export function MatrixCanvas({
  areas = [],
  grid,
  onCanvasClick,
  dragEndClickDelay = 0,
  renderArea,
  className = "",
  style,
  children,
}: MatrixCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // グリッド設定の自動計算
  const computedGrid = useMemo<GridConfig | null>(() => {
    if (grid) return grid;
    if (areas.length === 0) return null;

    // エリアから最大行・列を計算
    const maxRow = Math.max(...areas.map((a) => a.position.row)) + 1;
    const maxCol = Math.max(...areas.map((a) => a.position.col)) + 1;
    return { rows: maxRow, cols: maxCol };
  }, [grid, areas]);

  return (
    <MatrixProvider
      areas={areas}
      grid={computedGrid}
      dragEndClickDelay={dragEndClickDelay}
      canvasRef={canvasRef}
    >
      <MatrixCanvasInner
        canvasRef={canvasRef}
        areas={areas}
        grid={computedGrid}
        onCanvasClick={onCanvasClick}
        renderArea={renderArea}
        className={className}
        style={style}
      >
        {children}
      </MatrixCanvasInner>
    </MatrixProvider>
  );
}

interface MatrixCanvasInnerProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  areas: AreaConfig[];
  grid: GridConfig | null;
  onCanvasClick?: (position: Position, areaId: string | null) => void;
  renderArea?: (area: AreaConfig) => React.ReactNode;
  className: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

function MatrixCanvasInner({
  canvasRef,
  areas,
  grid,
  onCanvasClick,
  renderArea,
  className,
  style,
  children,
}: MatrixCanvasInnerProps) {
  const context = useMatrixContextOptional();

  // 座標からポジションを計算する共通関数
  const calculatePosition = useCallback(
    (clientX: number, clientY: number): Position | null => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return null;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      return clampPosition({ x, y });
    },
    [canvasRef]
  );

  // ドラッグ終了直後かどうかをチェック
  const isRecentDragEnd = useCallback(() => {
    if (context?.dragEndClickDelay && context.dragEndTimeRef?.current) {
      const timeSinceDragEnd = Date.now() - context.dragEndTimeRef.current;
      return timeSinceDragEnd < context.dragEndClickDelay;
    }
    return false;
  }, [context]);

  // マーカーやボタンのクリックかどうかをチェック
  const isInteractiveElement = useCallback((target: HTMLElement) => {
    return (
      target.closest(".react-matrix-canvas-marker") ||
      target.closest(".react-matrix-canvas-tooltip") ||
      target.closest("button")
    );
  }, []);

  // キャンバスクリックハンドラ（マウス）
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onCanvasClick) return;
      if (isRecentDragEnd()) return;
      if (isInteractiveElement(e.target as HTMLElement)) return;

      const position = calculatePosition(e.clientX, e.clientY);
      if (!position) return;

      const areaId = context?.getAreaFromPosition(position) ?? null;
      onCanvasClick(position, areaId);
    },
    [
      onCanvasClick,
      context,
      calculatePosition,
      isRecentDragEnd,
      isInteractiveElement,
    ]
  );

  // キャンバスタップハンドラ（タッチ）
  const handleCanvasTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!onCanvasClick) return;
      if (isRecentDragEnd()) return;
      if (isInteractiveElement(e.target as HTMLElement)) return;

      // タッチが1本で、移動がなかった場合のみタップとして処理
      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const position = calculatePosition(touch.clientX, touch.clientY);
      if (!position) return;

      const areaId = context?.getAreaFromPosition(position) ?? null;
      onCanvasClick(position, areaId);
    },
    [
      onCanvasClick,
      context,
      calculatePosition,
      isRecentDragEnd,
      isInteractiveElement,
    ]
  );

  // キャンバススタイル（メモ化）
  const canvasStyle = useMemo<CSSProperties>(() => {
    const gridStyle: CSSProperties = grid
      ? {
          display: "grid",
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        }
      : {};

    return {
      position: "relative",
      width: "100%",
      ...gridStyle,
      ...style,
    };
  }, [grid, style]);

  // エリアをグリッド位置でソート
  const sortedAreas = useMemo(() => {
    return [...areas].sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });
  }, [areas]);

  // className連結（メモ化）
  const combinedClassName = useMemo(
    () => ["react-matrix-canvas", className].filter(Boolean).join(" "),
    [className]
  );

  return (
    <div
      ref={canvasRef}
      className={combinedClassName}
      style={canvasStyle}
      onClick={handleCanvasClick}
      onTouchEnd={handleCanvasTouchEnd}
      role="application"
      aria-label="Matrix Canvas"
    >
      {sortedAreas.map((area) =>
        renderArea ? renderArea(area) : <Area key={area.id} config={area} />
      )}
      {children}
    </div>
  );
}
