import { useState } from "react";
import { processImage, segmentImage } from "../util/processImage";
import { uploadImageApi } from "../util/api";
import "../styles/UploadButton.css";
import { useSelector } from "react-redux";
import { useSocket } from "../components/SocketContext";

const UploadButton = () => {
  const [imageUrl, setImageUrl] = useState("");
  const socket = useSocket();
  const boardId = useSelector((state) => state.room.currentBoardId);
  console.log()

  const uploadImage = async (newImage) => {
    if (!newImage) return alert("Please select a file!");

    const { file: processedFile, width, height } = await processImage(newImage);
    const segments = await segmentImage(processedFile);
    const formData = new FormData();

  segments.forEach((segment) => {
    if (segment.blob instanceof Blob) {
      formData.append("images", new File([segment.blob], segment.name, { type: "image/webp" }));
    } else {
      console.error("Invalid blob detected:", segment);
    }
  });
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", window.innerWidth * (0.5 + Math.random() * 0.5));
    formData.append("y", window.innerHeight * (0.5 + Math.random() * 0.5));

    await uploadImageApi(formData, socket.id, boardId);
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
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter image URL"
        className="upload-input"
      />
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
