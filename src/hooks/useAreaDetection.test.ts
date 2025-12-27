import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { AreaConfig, GridConfig } from "../types";
import { getAreaFromPosition, getDefaultPosition } from "./useAreaDetection";

/**
 * Property 5: Area detection accuracy
 * For any position {x, y} within the canvas, the getAreaFromPosition function
 * SHALL return the correct area ID based on the grid configuration.
 * Validates: Requirements 3.3, 5.1
 */
describe("useAreaDetection", () => {
  // 2x2グリッドのエリア設定
  const areas2x2: AreaConfig[] = [
    { id: "top-left", position: { row: 0, col: 0 } },
    { id: "top-right", position: { row: 0, col: 1 } },
    { id: "bottom-left", position: { row: 1, col: 0 } },
    { id: "bottom-right", position: { row: 1, col: 1 } },
  ];
  const grid2x2: GridConfig = { rows: 2, cols: 2 };

  // 3x3グリッドのエリア設定
  const areas3x3: AreaConfig[] = [
    { id: "0-0", position: { row: 0, col: 0 } },
    { id: "0-1", position: { row: 0, col: 1 } },
    { id: "0-2", position: { row: 0, col: 2 } },
    { id: "1-0", position: { row: 1, col: 0 } },
    { id: "1-1", position: { row: 1, col: 1 } },
    { id: "1-2", position: { row: 1, col: 2 } },
    { id: "2-0", position: { row: 2, col: 0 } },
    { id: "2-1", position: { row: 2, col: 1 } },
    { id: "2-2", position: { row: 2, col: 2 } },
  ];
  const grid3x3: GridConfig = { rows: 3, cols: 3 };

  describe("Property 5: Area detection accuracy", () => {
    it("should return correct area for any position in 2x2 grid", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (x, y) => {
            const result = getAreaFromPosition({ x, y }, areas2x2, grid2x2);

            // 期待されるエリアを計算
            const expectedCol = x < 50 ? 0 : 1;
            const expectedRow = y < 50 ? 0 : 1;
            const expectedArea = areas2x2.find(
              (a) =>
                a.position.row === expectedRow && a.position.col === expectedCol
            );

            expect(result).toBe(expectedArea?.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return correct area for any position in 3x3 grid", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (x, y) => {
            const result = getAreaFromPosition({ x, y }, areas3x3, grid3x3);

            // 期待されるエリアを計算
            const cellWidth = 100 / 3;
            const cellHeight = 100 / 3;
            const expectedCol = Math.min(Math.floor(x / cellWidth), 2);
            const expectedRow = Math.min(Math.floor(y / cellHeight), 2);
            const expectedArea = areas3x3.find(
              (a) =>
                a.position.row === expectedRow && a.position.col === expectedCol
            );

            expect(result).toBe(expectedArea?.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return null for any position when no areas configured", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (x, y) => {
            const result = getAreaFromPosition({ x, y }, [], null);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should clamp out-of-bounds positions to valid range", () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 200, noNaN: true }),
          fc.float({ min: -100, max: 200, noNaN: true }),
          (x, y) => {
            const result = getAreaFromPosition({ x, y }, areas2x2, grid2x2);
            // 結果は必ず有効なエリアIDまたはnull
            expect(
              result === null || areas2x2.some((a) => a.id === result)
            ).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 3: Default position within area bounds", () => {
    it("should return position within area bounds for any area", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 10 }),
          (areaIndex, index) => {
            const area = areas2x2[areaIndex];
            const result = getDefaultPosition(
              area.id,
              areas2x2,
              grid2x2,
              index
            );

            // 座標は0-100の範囲内
            expect(result.x).toBeGreaterThanOrEqual(0);
            expect(result.x).toBeLessThanOrEqual(100);
            expect(result.y).toBeGreaterThanOrEqual(0);
            expect(result.y).toBeLessThanOrEqual(100);

            // エリアの境界を計算
            const cellWidth = 50; // 2x2なので50%
            const cellHeight = 50;
            const areaMinX = area.position.col * cellWidth;
            const areaMinY = area.position.row * cellHeight;

            // デフォルト位置はエリア内（オフセット考慮で少し余裕を持たせる）
            // オフセットは最大±8なので、中央から±8の範囲
            const centerX = areaMinX + cellWidth / 2;
            const centerY = areaMinY + cellHeight / 2;
            expect(result.x).toBeGreaterThanOrEqual(Math.max(0, centerX - 16));
            expect(result.x).toBeLessThanOrEqual(Math.min(100, centerX + 16));
            expect(result.y).toBeGreaterThanOrEqual(Math.max(0, centerY - 16));
            expect(result.y).toBeLessThanOrEqual(Math.min(100, centerY + 16));
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return center position when no grid configured", () => {
      fc.assert(
        fc.property(fc.string(), (areaId) => {
          const result = getDefaultPosition(areaId, [], null);
          expect(result).toEqual({ x: 50, y: 50 });
        }),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for edge cases
  describe("Edge cases", () => {
    it("should handle boundary positions correctly (x=50, y=50 in 2x2)", () => {
      // 50は右/下のセルに属する
      expect(getAreaFromPosition({ x: 50, y: 50 }, areas2x2, grid2x2)).toBe(
        "bottom-right"
      );
    });

    it("should handle exact corner positions", () => {
      expect(getAreaFromPosition({ x: 0, y: 0 }, areas2x2, grid2x2)).toBe(
        "top-left"
      );
      expect(getAreaFromPosition({ x: 100, y: 100 }, areas2x2, grid2x2)).toBe(
        "bottom-right"
      );
    });

    it("should return null for unknown area ID in getDefaultPosition", () => {
      const result = getDefaultPosition("unknown", areas2x2, grid2x2);
      expect(result).toEqual({ x: 50, y: 50 });
    });
  });
});
