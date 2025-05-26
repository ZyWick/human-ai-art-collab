import React, { useState, useMemo, useCallback } from "react";
import { useSocket } from "../../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentBoardId } from "../../redux/roomSlice";
import { selectAllBoards } from "../../redux/boardsSlice";
import "../../assets/styles/BoardsList.css";

const BoardsPanel = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.room.roomId);
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const boardData = useSelector(selectAllBoards);
  const [hoveredBoardId, setHoveredBoardId] = useState(null);

  const sortedBoards = useMemo(() =>
    [...boardData].sort((a, b) => b.isStarred - a.isStarred || new Date(b.updatedAt) - new Date(a.updatedAt)),
  [boardData]);

  const addNewBoard = useCallback(() => {
    socket.emit("newBoard", {
      name: "Untitled Board",
      roomId: currentRoomId,
      images: [],
      keywords: [],
      parentThreads: [],
      iterations: [],
      isStarred: false,
      isVoting: false,
    });
  }, [socket, currentRoomId]);
  

  const saveCopy = () => socket.emit("cloneBoard", currentBoardId);
  const loadBoard = useCallback((boardId) => dispatch(setCurrentBoardId(boardId)), [dispatch]);

  const starBoard = useCallback((boardId) => {
    socket.emit("starBoard", boardId);
  }, [socket]);

  const deleteBoard = useCallback((boardId, roomId) => {
    if (sortedBoards.length === 1) addNewBoard();
    socket.emit("deleteBoard", boardId, roomId);
  }, [socket, sortedBoards.length, addNewBoard]);

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
          borderRadius: "8px",
          boxShadow: [
            "inset 0 4px 6px -4px rgba(0,0,0,0)",
            "inset 0 -4px 6px -4px rgba(0,0,0,0.2)",
            "inset 1px 0 2px -1px rgba(0,0,0,0.05)",
            "inset -1px 0 2px -1px rgba(0,0,0,0.05)"
            
          ].join(", "),
        }}
        className="image-container"
      >
        {sortedBoards.map(
          ({ _id, name, isStarred, updatedAt, iterations, roomId }) => {
            const lastIteration = iterations?.[iterations.length - 1];
            const generatedImage = lastIteration?.generatedImages?.[0];

            return (
              <div
                key={_id}
                className="board-container"
                onClick={() => loadBoard(_id)}
                onMouseEnter={() => setHoveredBoardId(_id)}
                onMouseLeave={() => setHoveredBoardId(null)}
              >
                {hoveredBoardId === _id && (
                  <>
                    {!isStarred && (
                      <button
                        className="star-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          starBoard(_id);
                        }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2L14.92 8.62L22 9.27L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.27L9.08 8.62L12 2Z"
                            stroke="gold"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(_id, roomId);
                      }}
                    >
                      <strong>x</strong>
                    </button>
                  </>
                )}
                {isStarred && (
                  <button
                    className="star-button filled"
                    onClick={(e) => {
                      e.stopPropagation();
                      starBoard(_id);
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="-5 -5 34 34"
                      fill="gold"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <filter
                          id="shadow"
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feDropShadow
                            dx="2"
                            dy="2"
                            stdDeviation="3"
                            floodColor="black"
                            floodOpacity="0.3"
                          />
                        </filter>
                      </defs>
                      <path
                        d="M12 2L14.92 8.62L22 9.27L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.27L9.08 8.62L12 2Z"
                        fill="gold"
                        filter="url(#shadow)"
                      />
                    </svg>
                  </button>
                )}
                {generatedImage ? (
                  <img
                    className="image-preview"
                    alt="Generated"
                    src={generatedImage}
                  />
                ) : (
                  <div className="image-placeholder">No generated image</div>
                )}
                {name}
              </div>
            );
          }
        )}
      </div>
      <div style={{ width: "100%", marginTop: "auto", marginBottom: "4.5em" }}>
        {/* <hr
          style={{
            border: "none",
            minHeight: "0.05em",
            backgroundColor: "darkgrey",
            width: "100%",
          }}
        /> */}
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
