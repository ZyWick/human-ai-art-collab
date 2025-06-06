import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../../assets/styles/dashboard.css";
import KeywordSelection from "../widgets/KeywordSelection";
import { selectImageById } from "../../redux/imagesSlice";
import { NoteKeywordInput } from "../widgets/KeywordButton";
import { useSocket } from "../../context/SocketContext";

const Sidebar = ({stageRef}) => {
  const selectedImageId = useSelector(
    (state) => state.selection.selectedImageId
  );
  const selectedImage = useSelector((state) =>
    selectedImageId ? selectImageById(state, selectedImageId) : null
  );
  const boardId = useSelector((state) => state.room.currentBoardId);
  const socket = useSocket();

  const [isUploadingImg, setIsUploadingImg] = useState(false);
  

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = {
      boardId: boardId,
      type,
      keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
    };
    socket.emit("newKeyword", newKeyword);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
     
      {!isUploadingImg &&
        (selectedImage ? (
          <KeywordSelection selectedImage={selectedImage} />
        ) : (
          <div
            style={{
              width: "90%",
              height: "100%",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "white",
              overflowY: "auto",
              borderRadius: "8px",
              boxShadow: [
                "inset 0 4px 6px -4px rgba(0,0,0,0.2)",
                "inset 0 -4px 6px -4px rgba(0,0,0,0.2)",
                "inset 1px 0 2px -1px rgba(0,0,0,0.05)",
                "inset -1px 0 2px -1px rgba(0,0,0,0.05)"
                
              ].join(", "),
              // boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
              padding: "1em",
              marginTop: "1em",
            }}
          >
          </div>
        ))}
      <NoteKeywordInput addKeywordSelection={addKeywordSelection} />
    </div>
  );
};

export default Sidebar;
