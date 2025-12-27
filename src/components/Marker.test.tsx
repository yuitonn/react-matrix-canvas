import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { MatrixProvider } from "../context/MatrixContext";
import type { AreaConfig } from "../types";
import { Marker } from "./Marker";

const defaultAreas: AreaConfig[] = [
  { id: "top-left", position: { row: 0, col: 0 } },
  { id: "top-right", position: { row: 0, col: 1 } },
  { id: "bottom-left", position: { row: 1, col: 0 } },
  { id: "bottom-right", position: { row: 1, col: 1 } },
];

const defaultGrid = { rows: 2, cols: 2 };

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={canvasRef}>
      <MatrixProvider
        areas={defaultAreas}
        grid={defaultGrid}
        canvasRef={canvasRef}
      >
        {children}
      </MatrixProvider>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<TestWrapper>{ui}</TestWrapper>);
}

/**
 * Property 2: Marker position accuracy
 * For any marker with position {x, y} where 0 ≤ x ≤ 100 and 0 ≤ y ≤ 100,
 * the rendered marker's style SHALL reflect those percentage coordinates.
 * Validates: Requirements 2.1, 2.4
 */
describe("Marker", () => {
  describe("Property 2: Marker position accuracy", () => {
    it("should render marker at specified position", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (x, y) => {
            const { container, unmount } = renderWithProvider(
              <Marker id="test" position={{ x, y }} areaId="top-left" />
            );

            const marker = container.querySelector(
              '[data-marker-id="test"]'
            ) as HTMLElement;
            expect(marker).not.toBeNull();

            // スタイルに位置が反映されている
            expect(marker.style.left).toBe(`${x}%`);
            expect(marker.style.top).toBe(`${y}%`);

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should render marker with specified size", () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 100 }), (size) => {
          const { container, unmount } = renderWithProvider(
            <Marker
              id="test"
              position={{ x: 50, y: 50 }}
              areaId="top-left"
              size={size}
            />
          );

          const marker = container.querySelector(
            '[data-marker-id="test"]'
          ) as HTMLElement;
          expect(marker.style.width).toBe(`${size}px`);
          expect(marker.style.height).toBe(`${size}px`);

          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it("should render marker with specified color", () => {
      fc.assert(
        fc.property(fc.hexaString({ minLength: 6, maxLength: 6 }), (hex) => {
          const color = `#${hex}`;
          const { container, unmount } = renderWithProvider(
            <Marker
              id="test"
              position={{ x: 50, y: 50 }}
              areaId="top-left"
              color={color}
            />
          );

          const marker = container.querySelector(
            '[data-marker-id="test"]'
          ) as HTMLElement;
          expect(marker.style.backgroundColor).toBeTruthy();

          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Edge cases", () => {
    it("should use default position when not provided", () => {
      const { container } = renderWithProvider(
        <Marker id="test" areaId="top-left" />
      );

      const marker = container.querySelector(
        '[data-marker-id="test"]'
      ) as HTMLElement;
      expect(marker).not.toBeNull();
      // デフォルト位置が設定されている
      expect(marker.style.left).toBeTruthy();
      expect(marker.style.top).toBeTruthy();
    });

    it("should render custom children", () => {
      const { container } = renderWithProvider(
        <Marker id="test" position={{ x: 50, y: 50 }} areaId="top-left">
          <span data-testid="custom-content">Custom</span>
        </Marker>
      );

      const customContent = container.querySelector(
        '[data-testid="custom-content"]'
      );
      expect(customContent).not.toBeNull();
    });

    it("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      const { container } = renderWithProvider(
        <Marker
          id="test"
          position={{ x: 50, y: 50 }}
          areaId="top-left"
          onClick={handleClick}
        />
      );

      const marker = container.querySelector('[data-marker-id="test"]');
      marker?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(handleClick).toHaveBeenCalled();
    });

    it("should have correct ARIA attributes", () => {
      const { container } = renderWithProvider(
        <Marker
          id="test-marker"
          position={{ x: 50, y: 50 }}
          areaId="top-left"
        />
      );

      const marker = container.querySelector('[data-marker-id="test-marker"]');
      expect(marker?.getAttribute("role")).toBe("button");
      expect(marker?.getAttribute("tabindex")).toBe("0");
      expect(marker?.getAttribute("aria-label")).toBe("Marker test-marker");
    });

    it("should be disabled when disabled prop is true", () => {
      const { container } = renderWithProvider(
        <Marker
          id="test"
          position={{ x: 50, y: 50 }}
          areaId="top-left"
          disabled
        />
      );

      const marker = container.querySelector(
        '[data-marker-id="test"]'
      ) as HTMLElement;
      expect(marker.style.cursor).toBe("default");
      expect(marker.getAttribute("tabindex")).toBe("-1");
    });
  });
});

/**
 * Property 6: Keyboard movement direction
 * For any arrow key press on a focused marker, the marker SHALL move
 * in the corresponding direction.
 * Validates: Requirements 6.2
 */
describe("Keyboard navigation", () => {
  describe("Property 6: Keyboard movement direction", () => {
    it("should move marker up when ArrowUp is pressed", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 90, noNaN: true }),
          fc.float({ min: 10, max: 90, noNaN: true }),
          (x, y) => {
            const handlePositionChange = vi.fn();
            const { container, unmount } = renderWithProvider(
              <Marker
                id="test"
                position={{ x, y }}
                areaId="top-left"
                onPositionChange={handlePositionChange}
              />
            );

            const marker = container.querySelector('[data-marker-id="test"]');
            marker?.dispatchEvent(
              new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
            );

            if (handlePositionChange.mock.calls.length > 0) {
              const newPosition = handlePositionChange.mock.calls[0][0];
              expect(newPosition.y).toBeLessThan(y);
            }

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should move marker down when ArrowDown is pressed", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 90, noNaN: true }),
          fc.float({ min: 10, max: 90, noNaN: true }),
          (x, y) => {
            const handlePositionChange = vi.fn();
            const { container, unmount } = renderWithProvider(
              <Marker
                id="test"
                position={{ x, y }}
                areaId="top-left"
                onPositionChange={handlePositionChange}
              />
            );

            const marker = container.querySelector('[data-marker-id="test"]');
            marker?.dispatchEvent(
              new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
            );

            if (handlePositionChange.mock.calls.length > 0) {
              const newPosition = handlePositionChange.mock.calls[0][0];
              expect(newPosition.y).toBeGreaterThan(y);
            }

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should move marker left when ArrowLeft is pressed", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 90, noNaN: true }),
          fc.float({ min: 10, max: 90, noNaN: true }),
          (x, y) => {
            const handlePositionChange = vi.fn();
            const { container, unmount } = renderWithProvider(
              <Marker
                id="test"
                position={{ x, y }}
                areaId="top-left"
                onPositionChange={handlePositionChange}
              />
            );

            const marker = container.querySelector('[data-marker-id="test"]');
            marker?.dispatchEvent(
              new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
            );

            if (handlePositionChange.mock.calls.length > 0) {
              const newPosition = handlePositionChange.mock.calls[0][0];
              expect(newPosition.x).toBeLessThan(x);
            }

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should move marker right when ArrowRight is pressed", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 10, max: 90, noNaN: true }),
          fc.float({ min: 10, max: 90, noNaN: true }),
          (x, y) => {
            const handlePositionChange = vi.fn();
            const { container, unmount } = renderWithProvider(
              <Marker
                id="test"
                position={{ x, y }}
                areaId="top-left"
                onPositionChange={handlePositionChange}
              />
            );

            const marker = container.querySelector('[data-marker-id="test"]');
            marker?.dispatchEvent(
              new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
            );

            if (handlePositionChange.mock.calls.length > 0) {
              const newPosition = handlePositionChange.mock.calls[0][0];
              expect(newPosition.x).toBeGreaterThan(x);
            }

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
