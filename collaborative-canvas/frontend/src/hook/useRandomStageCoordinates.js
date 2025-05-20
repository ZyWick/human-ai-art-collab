import { useCallback } from "react";

function useRandomStageCoordinates(stageRef) {
  const getRandomCoordinates = useCallback(() => {
    if (!stageRef.current) {
      return { x: 0, y: 0 };
    }

    const stage = stageRef.current.getStage();
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Generate random coordinates within the stage
    const x = stageWidth * (0.4 + Math.random() * 0.4);
    const y = stageHeight * (0.4 + Math.random() * 0.4);

    // Convert pointer position to transformed stage coordinates
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const transformedPos = transform.point({ x, y });

    return { x: transformedPos.x, y: transformedPos.y };
  }, [stageRef]);

  return getRandomCoordinates;
}

export default useRandomStageCoordinates;
