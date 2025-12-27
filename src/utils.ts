import type { Position } from "./types";

/**
 * 座標を0-100の範囲にクランプ
 */
export function clampPosition(position: Position): Position {
  return {
    x: clamp(position.x, 0, 100),
    y: clamp(position.y, 0, 100),
  };
}

/**
 * 値を範囲内にクランプ
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
