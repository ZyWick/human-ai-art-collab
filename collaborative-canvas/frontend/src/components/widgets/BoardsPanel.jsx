import React from "react";
import { useSelector } from "react-redux";
import { useSocket } from '../../context/SocketContext'
import BoardsList from "./BoardsList";

const BoardsPanel = () => {
  const socket = useSocket();
  const currentRoomId = useSelector((state) => state.room.roomId);
  const currentBoardId = useSelector((state) => state.room.currentBoardId);

  const addNewBoard = () => {
    const newBoard = {
        name: "Untitled Board",
        roomId: currentRoomId,
        images: [],
        keywords: [],
        generatedImages: [],
        isStarred: false,
    };
    socket.emit("newBoard", newBoard);
  };

  const saveCopy = () => {
    socket.emit("cloneBoard", currentBoardId);
  };


  return (
    <>
      <div
        style={{
          flex: 1 /* Allows it to grow and fill remaining space */,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent:
            "flex-start" /* Prevents images from being centered vertically */,
          width: "100%",
          overflowY: "auto" /* Enables vertical scrolling */,
          scrollbarWidth: "none" /* Hide scrollbar for Firefox */,
          msOverflowStyle: "none" /* Hide scrollbar for IE/Edge */,
        }}
        className="image-container"
      >
      <BoardsList addNewBoard={addNewBoard} />
      </div>
      <div style={{ width: "100%", marginTop: "auto", marginBottom: "4.5em" }}>
        <hr
          style={{
            border: "none",
            minHeight: "0.05em",
            backgroundColor: "darkgrey",
            width: "100%",
          }}
        />
        <div style={{ display: "flex" }}>
          <button
            style={{
              border: "none",
              background: "transparent",
              color: "#444",
              width: "100%",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.3s ease, color 0.3s ease",
            }}
            onClick={addNewBoard}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(169, 169, 169, 0.15)";
              e.target.style.color = "black";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#444";
            }}
          >
            New board
          </button>
          <button
            style={{
              border: "none",
              background: "transparent",
              color: "#444",
              width: "100%",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.3s ease, color 0.3s ease",
            }}
              onClick={saveCopy}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(169, 169, 169, 0.15)";
              e.target.style.color = "black";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#444";
            }}
          >
            Save copy
          </button>
        </div>
      </div>
    </>
  );
};

export default BoardsPanel;
