/**
 * Eisenhower Matrix Example
 * 2x2 matrix for task prioritization
 */
import { useState } from "react";
import { Marker, MatrixCanvas, type ZoneConfig } from "react-matrix-canvas";

interface Task {
  id: string;
  title: string;
  zoneId: string;
  position: { x: number; y: number };
}

const zones: ZoneConfig[] = [
  {
    id: "do-first",
    label: "Do First",
    backgroundColor: "#fee2e2",
    labelColor: "#dc2626",
    position: { row: 0, col: 1 },
  },
  {
    id: "schedule",
    label: "Schedule",
    backgroundColor: "#dbeafe",
    labelColor: "#2563eb",
    position: { row: 0, col: 0 },
  },
  {
    id: "delegate",
    label: "Delegate",
    backgroundColor: "#fef3c7",
    labelColor: "#d97706",
    position: { row: 1, col: 1 },
  },
  {
    id: "eliminate",
    label: "Eliminate",
    backgroundColor: "#f3e8ff",
    labelColor: "#9333ea",
    position: { row: 1, col: 0 },
  },
];

export function EisenhowerMatrix() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Urgent meeting",
      zoneId: "do-first",
      position: { x: 75, y: 25 },
    },
    {
      id: "2",
      title: "Plan project",
      zoneId: "schedule",
      position: { x: 25, y: 25 },
    },
    {
      id: "3",
      title: "Reply emails",
      zoneId: "delegate",
      position: { x: 75, y: 75 },
    },
  ]);

  const handleCanvasClick = (
    position: { x: number; y: number },
    zoneId: string | null
  ) => {
    if (!zoneId) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: `Task ${tasks.length + 1}`,
      zoneId,
      position,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handlePositionChange = (
    taskId: string,
    position: { x: number; y: number }
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, position } : t))
    );
  };

  const handleZoneChange = (taskId: string, newZoneId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, zoneId: newZoneId } : t))
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Eisenhower Matrix</h1>
      <p>Click to add tasks, drag to move them between quadrants.</p>

      <MatrixCanvas
        zones={zones}
        grid={{ rows: 2, cols: 2 }}
        onCanvasClick={handleCanvasClick}
        style={{
          height: "500px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            id={task.id}
            position={task.position}
            zoneId={task.zoneId}
            onPositionChange={(pos) => handlePositionChange(task.id, pos)}
            onZoneChange={(newZone) => handleZoneChange(task.id, newZone)}
            tooltip={
              <div style={{ padding: "4px" }}>
                <strong>{task.title}</strong>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                  Zone: {task.zoneId}
                </p>
              </div>
            }
          />
        ))}
      </MatrixCanvas>
    </div>
  );
}
