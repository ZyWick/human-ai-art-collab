import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllBoards,  } from "../redux/boardsSlice";
import { useSocket } from "../components/SocketContext";
import { setCurrentBoardId } from "../redux/roomSlice";
import BoardsList from "./BoardsList";

const BoardsPanel = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.room.roomId);
  const boardData = useSelector(selectAllBoards)
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const sortedBoards = [...boardData].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const addNewBoard = () => {
    const newBoard = {
        name: "Untitled Board",
        roomId: currentRoomId,
        images: [],
        keywords: [],
        generatedImages: [],
    };
    socket.emit("newBoard", newBoard);
  };

  const saveCopy = () => {
    socket.emit("cloneBoard", currentBoardId);
  };

  const loadBoard = (boardId) => {
    dispatch(setCurrentBoardId(boardId))
  };

  const deleteBoard = (boardId, roomId) => {
    if (sortedBoards.length === 1)
      addNewBoard()
    socket.emit("deleteBoard", boardId, roomId);
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
        {sortedBoards.map((board) => (
            <BoardsList
                key={board._id} 
                board={board} 
                currentBoardId={currentBoardId}
                loadBoard={loadBoard} 
                deleteBoard={deleteBoard} 
            />
            ))}
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
