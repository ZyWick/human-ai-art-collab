import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from '../../context/SocketContext'
import { processImage, segmentImage } from "../../util/processImage";
import { uploadImageApi } from "../../util/api";
import { setSelectedImage } from "../../redux/selectionSlice";
import useRandomStageCoordinates from "../../hook/useRandomStageCoordinates";
import "../../assets/styles/UploadButton.css";
import "../../assets/styles/button.css";

function ProgressBar({ uploadProgress }) {
  if(!uploadProgress) return;
  return (<div style={{width: "100%", height: "1.1em"}}>
    <p
    style= {{
      color: "rgb(68,68,68)",
      marginTop: "6px",
      marginBottom: "1px",
      fontSize: "10px",
      textAlign: "left",
      whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    }}
    >{uploadProgress.fileName}</p>
    <div style={{
      width: '100%',
      height: '2px',
    }}>
      <div style={{ height: '100%',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease-in-out', width: `${uploadProgress.progress}%` }} />
    </div></div>
  );
}

const UploadButton = ({stageRef}) => {
  const [imageUrl, setImageUrl] = useState("");
  const socket = useSocket();
  const dispatch = useDispatch()
  const getRandomCoordinates = useRandomStageCoordinates(stageRef);
  const boardId = useSelector((state) => state.room.currentBoardId);
  const uploadProgressEs = useSelector((state) => state.room.uploadProgressEs);
  
  const uploadImage = async (newImage) => {
    if (!newImage) return alert("Please select a file!");
    if (!stageRef.current) return;    

    const { file: processedFile, width, height } = await processImage(newImage);
    const segments = await segmentImage(processedFile);
    const formData = new FormData();
    
    const { x, y } = getRandomCoordinates();
    
  segments.forEach((segment) => {
    if (segment.blob instanceof Blob) {
      formData.append("images", new File([segment.blob], segment.name, { type: "image/webp" }));
    } else {
      console.error("Invalid blob detected:", segment);
    }
  });
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", x);
    formData.append("y", y);

    const result = await uploadImageApi(formData, socket.id, boardId);
    dispatch(setSelectedImage(result.image._id))
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
    <div className="upload-container" style= {{maxHeight: "10.25%"}}>
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
        className="wideButton"
      >
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        Upload Image <img style={{marginLeft: "0.5em"}} src="/icons/upload.svg" alt="Add Comment" width="15" height="15" />
      </div></button>
      <input
        id="fileInput"
         type="file"
        accept="image/*"
        className="file-input"
        onChange={(e) => uploadImage(e.target.files[0])}
      />
    
      {uploadProgressEs && uploadProgressEs?.length>0 && 
      
      <div className="scrollable-container"
      style={{width: "100%",}}>
      {uploadProgressEs.map(
        (uploadProgress) => (<ProgressBar uploadProgress={uploadProgress} />))}
      </div>
        }
        
        </div>
  );
};

export default UploadButton;