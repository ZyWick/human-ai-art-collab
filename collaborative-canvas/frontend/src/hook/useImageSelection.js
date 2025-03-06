import { useEffect } from "react";

const useImageSelection = (stageRef, selectedImageId, setSelectedImageId, imageId, socket) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageId === imageId && e.key === "Delete") {
        socket.emit("deleteImage", imageId);
        setSelectedImageId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageId, imageId, setSelectedImageId, socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        setSelectedImageId(null);
      }
    };

    const stage = stageRef.current?.getStage();
    if (stage) {
      stage.on("click", handleClickOutside);
      stage.on("tap", handleClickOutside);
    }

    return () => {
      if (stage) {
        stage.off("click", handleClickOutside);
        stage.off("tap", handleClickOutside);
      }
    };
  }, [stageRef, setSelectedImageId]);
};

export default useImageSelection;
