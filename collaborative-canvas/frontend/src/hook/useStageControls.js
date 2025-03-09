import { useState, useEffect, useRef } from "react";
import Konva from "konva";

const GRID_SIZE = 40; // Base grid spacing

export const useStageControls = (stageRef, windowSize) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const gridLayerRef = useRef(null);

  // 🟢 Draw an infinite grid that adjusts based on zoom & pan
  const drawGrid = () => {
    const layer = gridLayerRef.current;
    const stage = stageRef.current;
    if (!layer || !stage) return;

    layer.destroyChildren(); // Clear previous grid

    const scaledGridSize = GRID_SIZE * transform.scale;
    const stageWidth = stage.width() * 3; // Expand grid beyond viewport
    const stageHeight = stage.height() * 3;
    
    const offsetX = (-transform.x % scaledGridSize) - scaledGridSize;
    const offsetY = (-transform.y % scaledGridSize) - scaledGridSize;

    for (let x = offsetX; x < stageWidth; x += scaledGridSize) {
      layer.add(new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: "#ddd",
        strokeWidth: 1,
      }));
    }
    for (let y = offsetY; y < stageHeight; y += scaledGridSize) {
      layer.add(new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: "#ddd",
        strokeWidth: 1,
      }));
    }

    layer.batchDraw(); // Optimize drawing performance
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const scaleBy = 1.05;
    const oldScale = transform.scale;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - transform.x) / oldScale,
      y: (pointer.y - transform.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.5), 3); // Limit zoom

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setTransform({ scale: clampedScale, x: newPos.x, y: newPos.y });
  };

  const handleDragMove = (e) => {
    setTransform((prev) => ({
      ...prev,
      x: e.target.x(),
      y: e.target.y(),
    }));
  };

  // 🟢 Redraw grid when zooming, panning, or resizing
  useEffect(() => {
    drawGrid();
  }, [transform.scale, transform.x, transform.y, windowSize]);

  return { transform, gridLayerRef, handleWheel, handleDragMove };
};
