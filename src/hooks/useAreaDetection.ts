import { useMemo } from "react";
import type { AreaConfig, GridConfig, Position } from "../types";
import { clamp } from "../utils";

interface UseAreaDetectionOptions {
  areas: AreaConfig[];
  grid: GridConfig | null;
}

interface UseAreaDetectionReturn {
  getAreaFromPosition: (position: Position) => string | null;
  getDefaultPosition: (areaId: string, index?: number) => Position;
}

/**
 * useAreaDetection - エリア判定ロジックを提供するhook
 */
export function useAreaDetection({
  areas,
  grid,
}: UseAreaDetectionOptions): UseAreaDetectionReturn {
  return useMemo(
    () => ({
      getAreaFromPosition: (position: Position) =>
        getAreaFromPosition(position, areas, grid),
      getDefaultPosition: (areaId: string, index?: number) =>
        getDefaultPosition(areaId, areas, grid, index),
    }),
    [areas, grid]
  );
}

/**
 * 座標からエリアIDを取得
 */
export function getAreaFromPosition(
  position: Position,
  areas: AreaConfig[],
  grid: GridConfig | null
): string | null {
  if (!grid || areas.length === 0) return null;

  const { rows, cols } = grid;
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  const x = clamp(position.x, 0, 100);
  const y = clamp(position.y, 0, 100);

  const col = Math.min(Math.floor(x / cellWidth), cols - 1);
  const row = Math.min(Math.floor(y / cellHeight), rows - 1);

  return (
    areas.find((a) => a.position.row === row && a.position.col === col)?.id ??
    null
  );
}

/**
 * エリアのデフォルト位置を取得
 */
export function getDefaultPosition(
  areaId: string,
  areas: AreaConfig[],
  grid: GridConfig | null,
  index: number = 0
): Position {
  if (!grid) return { x: 50, y: 50 };

  const area = areas.find((a) => a.id === areaId);
  if (!area) return { x: 50, y: 50 };

  const { rows, cols } = grid;
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  const centerX = area.position.col * cellWidth + cellWidth / 2;
  const centerY = area.position.row * cellHeight + cellHeight / 2;

  const offsetX = ((index % 3) - 1) * 8;
  const offsetY = ((Math.floor(index / 3) % 3) - 1) * 8;

  return {
    x: clamp(centerX + offsetX, 0, 100),
    y: clamp(centerY + offsetY, 0, 100),
  };
}
