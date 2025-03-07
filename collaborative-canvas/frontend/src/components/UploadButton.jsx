import { useState } from "react";
import { processImage } from "../util/processImage";
import { uploadImageApi } from "../util/api";
import "../styles/UploadButton.css";

const UploadButton = ({ socket, boardId }) => {
  const [imageUrl, setImageUrl] = useState("");

  const uploadImage = async (image) => {
    if (!image) return alert("Please select a file!");

    const { file: processedFile, width, height } = await processImage(image);
    const formData = new FormData();
    formData.append("image", processedFile);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", Math.random() * window.innerWidth * 0.55);
    formData.append("y", Math.random() * window.innerHeight * 0.6);

    const result = await uploadImageApi(formData, socket.id, boardId);

  };

  const uploadImageUrl = async () => {
    if (!imageUrl.trim()) return alert("Please enter a valid image URL!");
    const newImage = {
      boardId: boardId,
      url: imageUrl,
      x: Math.random() * window.innerWidth * 0.7,
      y: Math.random() * window.innerHeight * 0.7,
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
