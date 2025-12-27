# react-matrix-canvas

A React component library for creating interactive matrix/grid canvases with draggable markers. Perfect for building
Eisenhower matrices, BCG matrices, risk matrices, and other quadrant-based UIs.

## Features

- 🎯 **Flexible Grid System** - Support for 2x2, 3x3, or custom grid configurations
- 🖱️ **Drag & Drop** - Smooth dragging with area detection
- 📱 **Touch Support** - Full touch device support for mobile
- 💬 **Tooltips** - Built-in tooltip support with customizable content
- ⌨️ **Keyboard Navigation** - Full keyboard accessibility
- 🎨 **Customizable** - Minimal styling, easy to customize
- 📦 **Zero Dependencies** - Only React as peer dependency
- 🔷 **TypeScript** - Full type definitions included

## Installation

```bash
npm install react-matrix-canvas
```

## Quick Start

```tsx
import { MatrixCanvas, Marker, type AreaConfig } from 'react-matrix-canvas';

const areas: AreaConfig[] = [
  { id: 'urgent-important', label: 'Do First', backgroundColor: '#fee2e2', position: { row: 0, col: 0 } },
  { id: 'not-urgent-important', label: 'Schedule', backgroundColor: '#dbeafe', position: { row: 0, col: 1 } },
  { id: 'urgent-not-important', label: 'Delegate', backgroundColor: '#fef3c7', position: { row: 1, col: 0 } },
  { id: 'not-urgent-not-important', label: 'Eliminate', backgroundColor: '#f3e8ff', position: { row: 1, col: 1 } },
];

function App() {
  const [items, setItems] = useState([
    { id: '1', title: 'Task 1', areaId: 'urgent-important', position: { x: 25, y: 25 } },
  ]);

  return (
    <MatrixCanvas
      areas={areas}
      grid={{ rows: 2, cols: 2 }}
      onCanvasClick={(position, areaId) => {
        // Add new item at clicked position
      }}
      style={{ height: '500px' }}
    >
      {items.map(item => (
        <Marker
          key={item.id}
          id={item.id}
          position={item.position}
          areaId={item.areaId}
          onPositionChange={(newPos) => {
            setItems(prev => prev.map(i =>
              i.id === item.id ? { ...i, position: newPos } : i
            ));
          }}
          onAreaChange={(newArea) => {
            setItems(prev => prev.map(i =>
              i.id === item.id ? { ...i, areaId: newArea } : i
            ));
          }}
          tooltip={<div>{item.title}</div>}
        />
      ))}
    </MatrixCanvas>
  );
}
```

## API Reference

### MatrixCanvas

Main container component.

| Prop                | Type                             | Description                                             |
| ------------------- | -------------------------------- | ------------------------------------------------------- |
| `areas`             | `AreaConfig[]`                   | Area configurations (optional for free canvas)          |
| `grid`              | `{ rows: number; cols: number }` | Grid dimensions (auto-calculated from areas if omitted) |
| `onCanvasClick`     | `(position, areaId) => void`     | Callback when clicking empty canvas area                |
| `dragEndClickDelay` | `number`                         | Delay (ms) to ignore clicks after drag ends             |
| `renderArea`        | `(area) => ReactNode`            | Custom area renderer                                    |
| `className`         | `string`                         | Custom class name                                       |
| `style`             | `CSSProperties`                  | Custom styles                                           |

### Marker

Draggable marker component.

| Prop               | Type                               | Description                         |
| ------------------ | ---------------------------------- | ----------------------------------- |
| `id`               | `string`                           | Unique identifier                   |
| `position`         | `{ x: number; y: number }`         | Position in percentage (0-100)      |
| `areaId`           | `string`                           | Current area ID                     |
| `data`             | `T`                                | Custom data passed to renderTooltip |
| `onPositionChange` | `(position) => void`               | Callback when position changes      |
| `onAreaChange`     | `(newArea, oldArea) => void`       | Callback when area changes          |
| `onDragEnd`        | `() => void`                       | Callback when drag ends             |
| `onClick`          | `() => void`                       | Callback when clicked               |
| `tooltip`          | `ReactNode \| (data) => ReactNode` | Tooltip content                     |
| `renderTooltip`    | `(props) => ReactNode`             | Custom tooltip renderer             |
| `size`             | `number`                           | Marker size in pixels (default: 20) |
| `color`            | `string`                           | Marker color (default: #3b82f6)     |
| `hoverScale`       | `number`                           | Scale on hover (e.g., 1.25)         |
| `hoverClassName`   | `string`                           | Class name applied on hover         |
| `hoverStyle`       | `CSSProperties`                    | Style applied on hover              |
| `disabled`         | `boolean`                          | Disable dragging                    |
| `className`        | `string`                           | Custom class name                   |
| `style`            | `CSSProperties`                    | Custom styles                       |

### AreaConfig

```tsx
interface AreaConfig {
  id: string;
  label?: string;
  backgroundColor?: string;
  labelColor?: string;
  position: { row: number; col: number };
}
```

## Examples

### Custom Tooltip with renderTooltip

`renderTooltip`を使うと、ライブラリが提供する位置情報とマウスイベントを使って、独自のツールチップUIを実装できます。

```tsx
// ライブラリが提供するprops:
// - data: Markerに渡したカスタムデータ
// - position: ツールチップの表示位置 { top, left }
// - onMouseEnter/onMouseLeave: ホバー状態管理用

<Marker
  id="task-1"
  position={{ x: 50, y: 50 }}
  areaId="design"
  data={{ title: 'Task 1', status: 'active' }}
  renderTooltip={({ data, position, onMouseEnter, onMouseLeave }) => (
    <MyCustomTooltip
      title={data.title}
      status={data.status}
      style={{ top: position.top, left: position.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )}
/>
```

### Real-World Example: Hobbit Matrix

実際のアプリケーションでの使用例（アイゼンハワーマトリクス風のタスク管理）:

```tsx
import { MatrixCanvas, Marker, type AreaConfig } from 'react-matrix-canvas';
import { createPortal } from 'react-dom';

// エリア設定
const AREA_CONFIGS: AreaConfig[] = [
  { id: 'design', label: 'Design', backgroundColor: '#dbeafe', position: { row: 0, col: 0 } },
  { id: 'action', label: 'Action', backgroundColor: '#dcfce7', position: { row: 0, col: 1 } },
  { id: 'hold', label: 'Hold', backgroundColor: '#fef3c7', position: { row: 1, col: 0 } },
  { id: 'leave', label: 'Leave', backgroundColor: '#fee2e2', position: { row: 1, col: 1 } },
];

// カスタムツールチップ（Portalで表示）
function TaskTooltip({ task, position, onMouseEnter, onMouseLeave, onEdit, onDelete }) {
  return createPortal(
    <div
      className="fixed z-50 rounded-lg bg-white p-3 shadow-xl"
      style={{ top: position.top - 8, left: position.left, transform: 'translate(-50%, -100%)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h4>{task.title}</h4>
      <div className="mt-2 flex gap-2">
        <button onClick={onEdit}>編集</button>
        <button onClick={onDelete}>削除</button>
      </div>
    </div>,
    document.body
  );
}

function TaskMatrix({ tasks, onUpdateTask, onDeleteTask }) {
  // カスタムエリアレンダリング
  const renderArea = useCallback((area: AreaConfig) => (
    <div
      className="relative p-4"
      style={{ backgroundColor: area.backgroundColor }}
    >
      <span className="rounded-full bg-white px-3 py-1 shadow">
        {area.label}
      </span>
    </div>
  ), []);

  return (
    <MatrixCanvas
      areas={AREA_CONFIGS}
      grid={{ rows: 2, cols: 2 }}
      onCanvasClick={(position, areaId) => {
        // クリック位置とエリアIDを使って新規タスク作成
        console.log('Clicked at', position, 'in area', areaId);
      }}
      dragEndClickDelay={150}
      renderArea={renderArea}
      className="h-[600px] w-full"
    >
      {tasks.map(task => (
        <Marker
          key={task.id}
          id={task.id}
          position={task.position}
          areaId={task.areaId}
          data={task}
          onPositionChange={(pos) => onUpdateTask(task.id, { position: pos })}
          onAreaChange={(newAreaId) => onUpdateTask(task.id, { areaId: newAreaId })}
          color="#3b82f6"
          size={20}
          hoverScale={1.25}
          renderTooltip={({ data, position, onMouseEnter, onMouseLeave }) => (
            <TaskTooltip
              task={data}
              position={position}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onEdit={() => console.log('Edit', data.id)}
              onDelete={() => onDeleteTask(data.id)}
            />
          )}
        />
      ))}
    </MatrixCanvas>
  );
}
```

### Hover Effects

```tsx
<Marker
  id="1"
  position={{ x: 50, y: 50 }}
  hoverScale={1.25}
  hoverClassName="shadow-lg"
  hoverStyle={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
/>
```

### Prevent Click After Drag

```tsx
<MatrixCanvas
  areas={areas}
  dragEndClickDelay={150}  // Ignore clicks for 150ms after drag ends
  onCanvasClick={(position, areaId) => {
    // This won't fire immediately after dragging
  }}
>
  {/* markers */}
</MatrixCanvas>
```

### Free Canvas (No Areas)

```tsx
<MatrixCanvas>
  <Marker id="1" position={{ x: 50, y: 50 }} />
</MatrixCanvas>
```

### 2-Area Layout (Left/Right)

```tsx
<MatrixCanvas
  areas={[
    { id: 'low', label: 'Low', position: { row: 0, col: 0 } },
    { id: 'high', label: 'High', position: { row: 0, col: 1 } },
  ]}
  grid={{ rows: 1, cols: 2 }}
>
  {/* markers */}
</MatrixCanvas>
```

### 3x3 Grid

```tsx
<MatrixCanvas
  areas={[
    { id: '0-0', position: { row: 0, col: 0 } },
    { id: '0-1', position: { row: 0, col: 1 } },
    { id: '0-2', position: { row: 0, col: 2 } },
    // ... 9 areas total
  ]}
  grid={{ rows: 3, cols: 3 }}
>
  {/* markers */}
</MatrixCanvas>
```

## Architecture

このライブラリは「ライブラリが処理を担当し、アプリがUIを担当する」という設計思想に基づいています。

### ライブラリが提供するもの

- ドラッグ＆ドロップの処理
- エリア検出（どのエリアにいるか）
- 位置計算（パーセンテージベース）
- ツールチップの表示位置計算
- マウスイベントのハンドリング

### アプリが決めるもの

- エリアの見た目（`renderArea`）
- ツールチップの見た目（`renderTooltip`）
- マーカーのスタイル（`color`, `size`, `className`など）
- データの管理と永続化

## License

Copyright (c) 2025 yuitonn
