import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedImage } from "../redux/selectedImageSlice";
import { useSocket } from "../components/SocketContext";

const useImageSelection = (stageRef, imgDataId) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImage = useSelector((state) => state.selectedImage);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        selectedImage &&
        selectedImage._id === imgDataId &&
        e.key === "Delete"
      ) {
        socket.emit("deleteImage", imgDataId);
        dispatch(setSelectedImage(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, imgDataId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        dispatch(setSelectedImage(null));
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
  }, [stageRef]);
};

export default useImageSelection;
