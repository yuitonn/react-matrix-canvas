/**
 * Free Canvas Example
 * No zones, just a canvas with draggable markers
 */
import { useState } from "react";
import { Marker, MatrixCanvas } from "react-matrix-canvas";

interface Point {
  id: string;
  position: { x: number; y: number };
  color: string;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
];

export function FreeCanvas() {
  const [points, setPoints] = useState<Point[]>([
    { id: "1", position: { x: 30, y: 40 }, color: "#3b82f6" },
    { id: "2", position: { x: 70, y: 60 }, color: "#ef4444" },
  ]);

  const handleCanvasClick = (position: { x: number; y: number }) => {
    const newPoint: Point = {
      id: crypto.randomUUID(),
      position,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setPoints((prev) => [...prev, newPoint]);
  };

  const handlePositionChange = (
    pointId: string,
    position: { x: number; y: number }
  ) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, position } : p))
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Free Canvas</h1>
      <p>Click anywhere to add points, drag to move them.</p>

      <MatrixCanvas
        onCanvasClick={handleCanvasClick}
        style={{
          height: "400px",
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
        }}
      >
        {points.map((point) => (
          <Marker
            key={point.id}
            id={point.id}
            position={point.position}
            color={point.color}
            size={24}
            onPositionChange={(pos) => handlePositionChange(point.id, pos)}
            tooltip={
              <div>
                Position: ({point.position.x.toFixed(1)}%,{" "}
                {point.position.y.toFixed(1)}%)
              </div>
            }
          />
        ))}
      </MatrixCanvas>

      <p style={{ marginTop: "16px", color: "#666" }}>
        Points: {points.length}
      </p>
    </div>
  );
}
