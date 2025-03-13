import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedImage } from "../redux/selectionSlice";
import { useSocket } from '../context/SocketContext'

const useImageSelection = (stageRef, imgDataId) => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImageId = useSelector((state) => state.selection.selectedImageId);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        selectedImageId &&
        selectedImageId === imgDataId &&
        e.key === "Delete"
      ) {
        socket.emit("deleteImage", imgDataId);
        dispatch(setSelectedImage(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageId, imgDataId, dispatch, socket]);

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
  }, [stageRef, dispatch]);
};

export default useImageSelection;
