import type { CSSProperties, ReactNode, RefObject } from "react";

/**
 * Position - マーカーの座標（0-100%）
 */
export interface Position {
  /** X座標（0-100%） */
  x: number;
  /** Y座標（0-100%） */
  y: number;
}

/**
 * GridConfig - グリッド設定
 */
export interface GridConfig {
  /** 行数 */
  rows: number;
  /** 列数 */
  cols: number;
}

/**
 * AreaConfig - エリア設定
 */
export interface AreaConfig {
  /** エリアID */
  id: string;
  /** 表示ラベル */
  label?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** ラベルの色 */
  labelColor?: string;
  /** グリッド位置（row, col）- 0始まり */
  position: { row: number; col: number };
}

/**
 * MatrixCanvasProps - MatrixCanvasコンポーネントのProps
 */
export interface MatrixCanvasProps {
  /** エリア設定（省略時はエリアなしのフリーキャンバス） */
  areas?: AreaConfig[];
  /** グリッド設定（省略時はエリア数から自動計算） */
  grid?: GridConfig;
  /** キャンバスクリック時のコールバック */
  onCanvasClick?: (position: Position, areaId: string | null) => void;
  /** ドラッグ終了後のクリック無効化時間（ms）- デフォルト: 0 */
  dragEndClickDelay?: number;
  /** カスタムエリアレンダリング */
  renderArea?: (area: AreaConfig) => ReactNode;
  /** カスタムクラス名 */
  className?: string;
  /** カスタムスタイル */
  style?: CSSProperties;
  /** 子要素（Marker） */
  children?: ReactNode;
}

/**
 * MarkerProps - Markerコンポーネントのprops
 */
export interface MarkerProps<T = unknown> {
  /** マーカーID */
  id: string;
  /** 位置（0-100%） */
  position?: Position;
  /** 所属エリアID（エリアなしの場合は省略可） */
  areaId?: string;
  /** マーカーに紐づくデータ */
  data?: T;
  /** 位置変更時のコールバック */
  onPositionChange?: (position: Position) => void;
  /** エリア変更時のコールバック */
  onAreaChange?: (newAreaId: string, oldAreaId: string) => void;
  /** ドラッグ終了時のコールバック */
  onDragEnd?: () => void;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** ツールチップコンテンツ */
  tooltip?: ReactNode | ((data: T) => ReactNode);
  /** カスタムツールチップコンポーネント */
  renderTooltip?: (props: {
    data: T;
    position: { top: number; left: number };
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => ReactNode;
  /** カスタムレンダリング */
  children?: ReactNode;
  /** ドラッグ無効化 */
  disabled?: boolean;
  /** サイズ（px） */
  size?: number;
  /** 色 */
  color?: string;
  /** ホバー時のスケール（例: 1.25） */
  hoverScale?: number;
  /** カスタムクラス名 */
  className?: string;
  /** ホバー時のカスタムクラス名 */
  hoverClassName?: string;
  /** カスタムスタイル */
  style?: CSSProperties;
  /** ホバー時のカスタムスタイル */
  hoverStyle?: CSSProperties;
}

/**
 * AreaProps - Areaコンポーネントのprops
 */
export interface AreaProps {
  /** エリア設定 */
  config: AreaConfig;
  /** カスタムクラス名 */
  className?: string;
  /** カスタムスタイル */
  style?: CSSProperties;
  /** カスタムレンダリング */
  children?: ReactNode;
}

/**
 * TooltipProps - Tooltipコンポーネントのprops
 */
export interface TooltipProps {
  /** 表示するコンテンツ */
  content: ReactNode;
  /** 表示位置 */
  position: { top: number; left: number };
  /** 表示状態 */
  visible: boolean;
  /** マウスエンター時のコールバック */
  onMouseEnter?: () => void;
  /** マウスリーブ時のコールバック */
  onMouseLeave?: () => void;
  /** カスタムクラス名 */
  className?: string;
  /** カスタムスタイル */
  style?: CSSProperties;
}

/**
 * MatrixContextValue - MatrixContextの値
 */
export interface MatrixContextValue {
  /** キャンバスのref */
  canvasRef: RefObject<HTMLDivElement>;
  /** グリッド設定 */
  grid: GridConfig | null;
  /** エリア設定 */
  areas: AreaConfig[];
  /** 座標からエリアIDを取得 */
  getAreaFromPosition: (position: Position) => string | null;
  /** エリアのデフォルト位置を取得 */
  getDefaultPosition: (areaId: string, index?: number) => Position;
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** ドラッグ状態を設定 */
  setIsDragging: (dragging: boolean) => void;
  /** ドラッグ終了後のクリック無効化時間（ms） */
  dragEndClickDelay: number;
  /** ドラッグ終了時刻のref */
  dragEndTimeRef?: RefObject<number>;
}

/**
 * UseDraggableOptions - useDraggable hookのオプション
 */
export interface UseDraggableOptions {
  /** 親要素（キャンバス）のref */
  containerRef: RefObject<HTMLElement | null>;
  /** 位置変更時のコールバック */
  onPositionChange?: (position: Position) => void;
  /** ドラッグ開始時のコールバック */
  onDragStart?: () => void;
  /** ドラッグ終了時のコールバック */
  onDragEnd?: () => void;
  /** ドラッグ無効化 */
  disabled?: boolean;
}

/**
 * UseDraggableReturn - useDraggable hookの戻り値
 */
export interface UseDraggableReturn {
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** mousedownイベントハンドラ */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** touchstartイベントハンドラ */
  handleTouchStart: (e: React.TouchEvent) => void;
  /** 実際にドラッグ（移動）が発生したかを追跡するref */
  hasDraggedRef: React.RefObject<boolean>;
  /** ドラッグ終了時刻を記録するref */
  dragEndTimeRef: React.RefObject<number>;
}

/**
 * UseTooltipOptions - useTooltip hookのオプション
 */
export interface UseTooltipOptions {
  /** ツールチップを表示する対象要素のref */
  elementRef: RefObject<HTMLElement | null>;
  /** 表示遅延（ms） */
  showDelay?: number;
  /** 非表示遅延（ms） */
  hideDelay?: number;
}

/**
 * UseTooltipReturn - useTooltip hookの戻り値
 */
export interface UseTooltipReturn {
  /** ツールチップを表示するかどうか */
  showTooltip: boolean;
  /** ツールチップの位置 */
  tooltipPosition: { top: number; left: number } | null;
  /** マウスエンター時のハンドラ */
  handleShowTooltip: () => void;
  /** マウスリーブ時のハンドラ */
  handleHideTooltip: () => void;
}
