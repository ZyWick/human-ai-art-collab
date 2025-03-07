import { useEffect } from "react";

const useImageSelection = (stageRef, selectedImageId, setSelectedImage, imgDataId, socket) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageId === imgDataId && e.key === "Delete") {
        socket.emit("deleteImage", imgDataId);
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageId, imgDataId, setSelectedImage, socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        setSelectedImage(null);
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
  }, [stageRef, setSelectedImage]);
};

export default useImageSelection;
