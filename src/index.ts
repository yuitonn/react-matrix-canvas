// Components
export { Area } from "./components/Area";
export { Marker } from "./components/Marker";
export { MatrixCanvas } from "./components/MatrixCanvas";
export { Tooltip } from "./components/Tooltip";

// Hooks
export { useAreaDetection } from "./hooks/useAreaDetection";
export { useDraggable } from "./hooks/useDraggable";
export { useTooltip } from "./hooks/useTooltip";

// Context
export {
  MatrixProvider,
  useMatrixContext,
  useMatrixContextOptional,
} from "./context/MatrixContext";

// Utils
export { clamp, clampPosition } from "./utils";

// Types
export type {
  AreaConfig,
  AreaProps,
  GridConfig,
  MarkerProps,
  MatrixCanvasProps,
  MatrixContextValue,
  Position,
  TooltipProps,
  UseDraggableOptions,
  UseDraggableReturn,
  UseTooltipOptions,
  UseTooltipReturn,
} from "./types";
