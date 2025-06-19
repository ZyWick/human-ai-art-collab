import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { processImage, segmentImage } from "../../util/processImage";
import { uploadImageApi } from "../../util/api";
import useRandomStageCoordinates from "../../hook/useRandomStageCoordinates";
import "../../assets/styles/button.css";

function ProgressBar({ uploadProgress }) {
  if (!uploadProgress) return;
  return (
    <div style={{ width: "100%", height: "1.1em" }}>
      <p
        style={{
          color: "rgb(68,68,68)",
          marginTop: "6px",
          marginBottom: "1px",
          fontSize: "10px",
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {uploadProgress.fileName}
      </p>
      <div
        style={{
          width: "100%",
          height: "2px",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#007bff",
            transition: "width 0.3s ease-in-out",
            width: `${uploadProgress.progress}%`,
          }}
        />
      </div>
    </div>
  );
}

const UploadButton = ({ stageRef, isDesignDetailsEmpty }) => {
  const socket = useSocket();
  const getRandomCoordinates = useRandomStageCoordinates(stageRef);
  const boardId = useSelector((state) => state.room.currentBoardId);
  const uploadProgressEs = useSelector((state) => state.room.uploadProgressEs);
  const [clickedDisabled, setClickedDisabled] = useState(false);

  // Hide the message after 3 seconds
  useEffect(() => {
    if (clickedDisabled) {
      const timeout = setTimeout(() => setClickedDisabled(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [clickedDisabled]);

  const uploadImage = async (newImage) => {
    if (!newImage) return alert("Please select a file!");
    if (!stageRef.current) return;

    const { file: processedFile, width, height } = await processImage(newImage);
    const segments = await segmentImage(processedFile);
    const formData = new FormData();

    const { x, y } = getRandomCoordinates();

    segments.forEach((segment) => {
      if (segment.blob instanceof Blob) {
        formData.append(
          "images",
          new File([segment.blob], segment.name, { type: "image/webp" })
        );
      } else {
        console.error("Invalid blob detected:", segment);
      }
    });
    formData.append("width", width);
    formData.append("height", height);
    formData.append("x", x);
    formData.append("y", y);

    await uploadImageApi(formData, socket.id, boardId);
  };
  
  return (
    <div className="upload-container" style={{ maxHeight: "10.25%" }}>
      <button
        onClick={() => {
          if (isDesignDetailsEmpty) {
            if (!clickedDisabled) setClickedDisabled(true);
          } else document.getElementById("fileInput").click();
        }}
        style={{
          backgroundColor: isDesignDetailsEmpty ? "#ccc" : "white",
          color: isDesignDetailsEmpty ? "#777" : "black",
        }}
        className="wideButton"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Upload Image
          <svg
            style={{ marginLeft: "0.5em" }}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={isDesignDetailsEmpty ? "#777" : "#000"} // Control icon color based on disabled state
          >
            <path
              fillRule="evenodd"
              d="M21,16 C21.5128358,16 21.9355072,16.3860402 21.9932723,16.8833789 L22,17 L22,19 C22,20.5976809 20.75108,21.9036609 19.1762728,21.9949073 L19,22 L5,22 C3.40231912,22 2.09633912,20.75108 2.00509269,19.1762728 L2,19 L2,17 C2,16.4477153 2.44771525,16 3,16 C3.51283584,16 3.93550716,16.3860402 3.99327227,16.8833789 L4,17 L4,19 C4,19.5128358 4.38604019,19.9355072 4.88337887,19.9932723 L5,20 L19,20 C19.5128358,20 19.9355072,19.6139598 19.9932723,19.1166211 L20,19 L20,17 C20,16.4477153 20.4477153,16 21,16 Z M11.8515331,2.0110178 L11.909968,2.00399798 L12,2 L12.0752385,2.00278786 L12.2007258,2.02024007 L12.3121425,2.04973809 L12.4232215,2.09367336 L12.5207088,2.14599545 L12.625449,2.21968877 L12.7071068,2.29289322 L15.7071068,5.29289322 C16.0976311,5.68341751 16.0976311,6.31658249 15.7071068,6.70710678 C15.3165825,7.09763107 14.6834175,7.09763107 14.2928932,6.70710678 L13,5.414 L13,15 C13,15.5522847 12.5522847,16 12,16 C11.4477153,16 11,15.5522847 11,15 L11,5.414 L9.70710678,6.70710678 C9.31658249,7.09763107 8.68341751,7.09763107 8.29289322,6.70710678 C7.90236893,6.31658249 7.90236893,5.68341751 8.29289322,5.29289322 L11.2928932,2.29289322 C11.3282873,2.25749917 11.3656744,2.22531295 11.4046934,2.19633458 L11.5159379,2.12467117 L11.628664,2.07122549 L11.734007,2.03584514 L11.8515331,2.0110178 Z"
            />
          </svg>
        </div>
      </button>
      {clickedDisabled && isDesignDetailsEmpty && (
        <p
          style={{
            fontSize: "0.65em",
            marginBlock: "0",
            textAlign: "center",
            color: "#cc0000",
          }}
        >
          complete the design brief to add images.
        </p>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        className="file-input"
        onChange={(e) => uploadImage(e.target.files[0])}
      />

      {uploadProgressEs && uploadProgressEs?.length > 0 && (
        <div className="scrollable-container" style={{ width: "100%" }}>
          {uploadProgressEs.map((uploadProgress) => (
            <ProgressBar key={uploadProgress.uploadId} uploadProgress={uploadProgress} />
            
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadButton;
