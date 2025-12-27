import type { ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAreaDetection } from "../hooks/useAreaDetection";
import type { AreaConfig, GridConfig, MatrixContextValue } from "../types";

const MatrixContext = createContext<MatrixContextValue | null>(null);

interface MatrixProviderProps {
  areas: AreaConfig[];
  grid: GridConfig | null;
  dragEndClickDelay?: number;
  canvasRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

/**
 * MatrixProvider - MatrixContextを提供するプロバイダー
 */
export function MatrixProvider({
  areas,
  grid,
  dragEndClickDelay = 0,
  canvasRef,
  children,
}: MatrixProviderProps) {
  const [isDragging, setIsDraggingState] = useState(false);
  const dragEndTimeRef = useRef<number>(0);

  const { getAreaFromPosition, getDefaultPosition } = useAreaDetection({
    areas,
    grid,
  });

  // ドラッグ状態を設定（終了時にタイムスタンプを記録）
  const setIsDragging = useCallback((dragging: boolean) => {
    setIsDraggingState(dragging);
    if (!dragging) {
      dragEndTimeRef.current = Date.now();
    }
  }, []);

  const value = useMemo<MatrixContextValue>(
    () => ({
      canvasRef,
      grid,
      areas,
      getAreaFromPosition,
      getDefaultPosition,
      isDragging,
      setIsDragging,
      dragEndClickDelay,
      dragEndTimeRef,
    }),
    [
      canvasRef,
      grid,
      areas,
      getAreaFromPosition,
      getDefaultPosition,
      isDragging,
      setIsDragging,
      dragEndClickDelay,
    ]
  );

  return (
    <MatrixContext.Provider value={value}>{children}</MatrixContext.Provider>
  );
}

/**
 * useMatrixContext - MatrixContextを取得するhook
 */
export function useMatrixContext(): MatrixContextValue {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error("useMatrixContext must be used within a MatrixProvider");
  }
  return context;
}

/**
 * useMatrixContextOptional - MatrixContextを取得するhook（オプショナル）
 * Contextがない場合はnullを返す
 */
export function useMatrixContextOptional(): MatrixContextValue | null {
  return useContext(MatrixContext);
}
