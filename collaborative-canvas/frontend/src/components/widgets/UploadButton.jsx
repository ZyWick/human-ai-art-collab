import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from '../../context/SocketContext'
import { processImage, segmentImage } from "../../util/processImage";
import { uploadImageApi } from "../../util/api";
import "../../assets/styles/UploadButton.css";
import "../../assets/styles/keywordSelection.css";
import { setSelectedImage } from "../../redux/selectionSlice";

const UploadButton = ({isUploadingImg, setIsUploadingImg}) => {
  const [imageUrl, setImageUrl] = useState("");
  const socket = useSocket();
  const dispatch = useDispatch();
  const boardId = useSelector((state) => state.room.currentBoardId);
  const [imageSrc, setImageSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [input, setInput] = useState("");

  const uploadImage = (newImage) => {
    if (!newImage) return alert("Please select a file!");
    setIsUploadingImg(true)
    setImage(newImage); 
    setImageSrc(URL.createObjectURL(newImage));
  }

  const handleKeyDown = async(event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!image) return alert("No image selected!");
      await uploadImageComplete(image, input);
    }
  };

  const uploadImageComplete = async (newImage, answer) => {
    setIsUploadingImg(false);
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

    const result = await uploadImageApi(formData, socket.id, boardId);
    console.log(answer)
    console.log(result._doc._id)
    dispatch(setSelectedImage(result._doc._id))
    setIsUploadingImg(false);
    setImageSrc(null);
    setImage(null);
    setInput(""); // Clear input after upload
  };

  const handleCancel = () => {
    setIsUploadingImg(false);
    setImageSrc(null);
    setImage(null);
    setInput(""); // Clear input after upload
  }

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

  return (<>
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
    {isUploadingImg &&<>
    <img className="image-preview-selection" alt="" src={imageSrc} />
    <hr className="divider" />
    <div className="keyword-container" style={{marginTop: "1em"}}>
        <h3 className="keyword-title" >Wouldn't it be great if...</h3>
        <p className="keyword-subtitle"></p>
      </div>
      <textarea
        style={{
          width: "90%",
          minHeight: "10%",
          padding: "0.5em",
          borderRadius: "4px",
          border: "1px solid lightgrey"
        }}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
      onClick={handleCancel}
      style={{marginRight: "auto", marginLeft: "1em", marginTop: "1em"}}>
        cancel</button>
    </>
    
    }
    </>
  );
};

export default UploadButton;
