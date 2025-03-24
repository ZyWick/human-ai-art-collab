import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from '../../context/SocketContext'
import { processImage, segmentImage } from "../../util/processImage";
import { uploadImageApi } from "../../util/api";
import { setSelectedImage } from "../../redux/selectionSlice";
import "../../assets/styles/UploadButton.css";

const UploadButton = ({stageRef}) => {
  const [imageUrl, setImageUrl] = useState("");
  const socket = useSocket();
  const dispatch = useDispatch()
  const boardId = useSelector((state) => state.room.currentBoardId);

  const uploadImage = async (newImage) => {
    if (!newImage) return alert("Please select a file!");
    if (!stageRef.current) return;    

    const { file: processedFile, width, height } = await processImage(newImage);
    const segments = await segmentImage(processedFile);
    const formData = new FormData();
    
    const stage = stageRef.current.getStage();
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Generate random coordinates within the stage
    const randomX = stageWidth * (0.4 + Math.random() * 0.4);
    const randomY = stageHeight * (0.4+ Math.random() * 0.4);
    
    // Convert pointer position to transformed stage coordinates
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const transformedPos = transform.point({ x: randomX, y: randomY });

  segments.forEach((segment) => {
    if (segment.blob instanceof Blob) {
      formData.append("images", new File([segment.blob], segment.name, { type: "image/webp" }));
    } else {
      console.error("Invalid blob detected:", segment);
    }
  });
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", transformedPos.x);
    formData.append("y", transformedPos.y);

    const result = await uploadImageApi(formData, socket.id, boardId);
    dispatch(setSelectedImage(result._doc._id))
  };

  const uploadImageUrl = async () => {
    if (!imageUrl.trim()) return alert("Please enter a valid image URL!");
    const newImage = {
      boardId: boardId,
      url: imageUrl,
      x: window.innerWidth * (0.5 + Math.random() * 0.5),
      y: window.innerHeight * (0.5 + Math.random() * 0.5),      
    };

    socket.emit("newImage", newImage);
    setImageUrl("");
  };

  return (
    <div className="upload-container">
      {/* <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter image URL"
        className="upload-input"
      /> */}
      <button
        onClick={
          imageUrl.trim()
            ? uploadImageUrl
            : () => document.getElementById("fileInput").click()
        }
        className="upload-button"
      >
        {imageUrl.trim() ? "Add Image" : "Upload File"}
      </button>
      <input
        id="fileInput"
        type="file"
        className="file-input"
        onChange={(e) => uploadImage(e.target.files[0])}
      />
    </div>
  );
};

export default UploadButton;