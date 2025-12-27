import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { clampPosition } from "../utils";

/**
 * Property 4: Drag position clamping
 * For any drag operation, the resulting position coordinates
 * SHALL be clamped to the range [0, 100] for both x and y.
 * Validates: Requirements 3.4
 */
describe("useDraggable", () => {
  describe("Property 4: Drag position clamping", () => {
    it("should clamp any position to [0, 100] range", () => {
      fc.assert(
        fc.property(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          (x, y) => {
            const result = clampPosition({ x, y });

            // 結果は常に0-100の範囲内
            expect(result.x).toBeGreaterThanOrEqual(0);
            expect(result.x).toBeLessThanOrEqual(100);
            expect(result.y).toBeGreaterThanOrEqual(0);
            expect(result.y).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve valid positions within [0, 100]", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (x, y) => {
            const result = clampPosition({ x, y });

            // 有効な範囲内の座標はそのまま保持
            expect(result.x).toBeCloseTo(x, 5);
            expect(result.y).toBeCloseTo(y, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should clamp negative values to 0", () => {
      fc.assert(
        fc.property(
          fc.float({ min: -1000, max: Math.fround(-0.001), noNaN: true }),
          fc.float({ min: -1000, max: Math.fround(-0.001), noNaN: true }),
          (x, y) => {
            const result = clampPosition({ x, y });

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should clamp values over 100 to 100", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(100.001), max: 1000, noNaN: true }),
          fc.float({ min: Math.fround(100.001), max: 1000, noNaN: true }),
          (x, y) => {
            const result = clampPosition({ x, y });

            expect(result.x).toBe(100);
            expect(result.y).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for edge cases
  describe("Edge cases", () => {
    it("should handle exact boundary values", () => {
      expect(clampPosition({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
      expect(clampPosition({ x: 100, y: 100 })).toEqual({ x: 100, y: 100 });
    });

    it("should handle mixed valid/invalid coordinates", () => {
      expect(clampPosition({ x: -10, y: 50 })).toEqual({ x: 0, y: 50 });
      expect(clampPosition({ x: 50, y: 150 })).toEqual({ x: 50, y: 100 });
    });
  });
});
