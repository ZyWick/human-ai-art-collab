import { useState } from "react";
import { processImage, processImageUrl } from "../util/processImage";

const UploadButton = ({ socket, boardId }) => {
  const [imageUrl, setImageUrl] = useState("");

  const uploadImage = async (image) => {
    if (!image) return alert("Please select a file!");
    
    const { file: processedFile, width, height } = await processImage(image);
    const formData = new FormData();
    formData.append("image", processedFile);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", Math.random() * window.innerWidth * 0.7);
    formData.append("y", Math.random() * window.innerHeight * 0.7);
    
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
      headers: {
        "socket-id": socket.id,
        "board-id": boardId,
      },
    });
    await res.json();
  };

  const uploadImageUrl = async () => {
    if (!imageUrl.trim()) return alert("Please enter a valid image URL!");
    console.log(imageUrl)
    // const { width, height } = await processImageUrl(imageUrl);
    // console.log({ width, height })
    const newImage = {
      boardId: boardId,
      url: imageUrl,
      x: Math.random() * window.innerWidth * 0.7,
      y: Math.random() * window.innerHeight * 0.7,
      // width: width,
      // height: height,
    };
    
    socket.emit("newImage", newImage);
    setImageUrl("");
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter image URL"
        style={{ flex: 1, padding: "8px" }}
      />
      <button
        onClick={imageUrl.trim() ? uploadImageUrl : () => document.getElementById("fileInput").click()}
        style={{ flex: 1, padding: "8px", background: "blue", color: "white", border: "none", cursor: "pointer" }}
      >
        {imageUrl.trim() ? "Add Image" : "Upload File"}
      </button>
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={(e) => uploadImage(e.target.files[0]) }
      />
    </div>
  );
};

export default UploadButton;
