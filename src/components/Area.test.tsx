import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { AreaConfig } from "../types";
import { Area } from "./Area";

/**
 * Property 1: Area rendering consistency
 * For any valid area configuration array, the rendered MatrixCanvas SHALL contain
 * exactly the same number of area elements as the configuration array length,
 * and each area SHALL display its configured label and background color.
 * Validates: Requirements 1.1, 1.2, 1.3
 */
describe("Area", () => {
  describe("Property 1: Area rendering consistency", () => {
    it("should render area with configured label", () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9-_]*$/),
          fc.stringMatching(/^[a-zA-Z0-9 ]+$/),
          (id, label) => {
            const config: AreaConfig = {
              id,
              label,
              position: { row: 0, col: 0 },
            };

            const { container, unmount } = render(<Area config={config} />);

            // ラベルが表示されている
            expect(container.textContent).toContain(label);

            // data-area-idが設定されている
            const areaElement = container.querySelector(
              `[data-area-id="${id}"]`
            );
            expect(areaElement).not.toBeNull();

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should render area with configured background color", () => {
      fc.assert(
        fc.property(
          fc.hexaString({ minLength: 6, maxLength: 6 }),
          (hexColor) => {
            const backgroundColor = `#${hexColor}`;
            const config: AreaConfig = {
              id: "test-area",
              label: "Test",
              backgroundColor,
              position: { row: 0, col: 0 },
            };

            const { container, unmount } = render(<Area config={config} />);

            const areaElement = container.querySelector(
              '[data-area-id="test-area"]'
            ) as HTMLElement;
            expect(areaElement).not.toBeNull();
            expect(areaElement.style.backgroundColor).toBeTruthy();

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should render area without label when label is not provided", () => {
      const config: AreaConfig = {
        id: "no-label-area",
        position: { row: 0, col: 0 },
      };

      const { container } = render(<Area config={config} />);

      const areaElement = container.querySelector(
        '[data-area-id="no-label-area"]'
      );
      expect(areaElement).not.toBeNull();
      expect(areaElement?.textContent).toBe("");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty label", () => {
      const config: AreaConfig = {
        id: "empty-label",
        label: "",
        position: { row: 0, col: 0 },
      };

      const { container } = render(<Area config={config} />);
      const areaElement = container.querySelector(
        '[data-area-id="empty-label"]'
      );
      expect(areaElement).not.toBeNull();
    });

    it("should apply custom className", () => {
      const config: AreaConfig = {
        id: "custom-class",
        position: { row: 0, col: 0 },
      };

      const { container } = render(
        <Area config={config} className="my-custom-class" />
      );
      const areaElement = container.querySelector(
        '[data-area-id="custom-class"]'
      );
      expect(areaElement?.classList.contains("my-custom-class")).toBe(true);
    });

    it("should apply custom style", () => {
      const config: AreaConfig = {
        id: "custom-style",
        position: { row: 0, col: 0 },
      };

      const { container } = render(
        <Area config={config} style={{ border: "1px solid red" }} />
      );
      const areaElement = container.querySelector(
        '[data-area-id="custom-style"]'
      ) as HTMLElement;
      expect(areaElement.style.border).toBe("1px solid red");
    });
  });
});
