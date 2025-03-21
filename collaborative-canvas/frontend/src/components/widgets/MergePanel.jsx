import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeywordButton } from "./KeywordButton";
import { useSocket } from '../../context/SocketContext'
import { selectBoardById } from "../../redux/boardsSlice";
import { updateKeyword } from "../../redux/keywordsSlice";
import { selectAllKeywords } from "../../redux/keywordsSlice";

const MergePanel = () => {
  const selectedKeywordIds = useSelector(
    (state) => state.selection.selectedKeywordIds
  );
  
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const keywordRefs = useRef({});
  const socket = useSocket();
  const dispatch = useDispatch();
  const keywords = useSelector(selectAllKeywords)  

  const selectedBoardKeywords = keywords.filter(
      (keyword) =>
        keyword.offsetX !== undefined && keyword.offsetY !== undefined
    ).filter((keyword) =>
    selectedKeywordIds.includes(keyword._id)
  );
  
  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );
  const generatedImages = currBoard?.generatedImages;
  const generateImage = () => {
    if (selectedBoardKeywords?.length > 0)
    socket.emit("generateNewImage", {boardId: currentBoardId, keywords:  (selectedBoardKeywords)});
  };

    const toggleSelected = (keyword) => {
      const update = { id: keyword._id, changes: { isSelected: !keyword.isSelected } };
      dispatch(updateKeyword(update));
      socket.emit("toggleSelectedKeyword", keyword._id);
      socket.emit("updateKeywordSelected", update);

    };

  return (
    <>
      {/* Keywords Section */}
      <div
        style={{
          width: "90%",
          maxHeight: "60%",
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          flexWrap: "wrap",
          gap: "0.2em",
        }}
      >
        {selectedBoardKeywords && selectedBoardKeywords.length > 0 ? (
          selectedBoardKeywords.map((keyword) => (
            <KeywordButton
              key={keyword._id}
              ref={(el) => {
                if (el) keywordRefs.current[keyword._id] = el;
              }}
              text={keyword.keyword}
              type={keyword.type}
              isSelected={true}
              onClick={() => {
                toggleSelected(keyword);
              }}
            />
          ))
        ) : (
          <div style={{ marginTop: "0.55em", color: "rgb(68,68,68)" }}>
            selected keywords appear here
          </div>
        )}
      </div>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          height: "0.05em",
          backgroundColor: "darkgrey",
          width: "100%",
          marginTop: "0.85em",
          marginBottom: "0.25em",
        }}
      />

      {/* Image Container - Takes Up Remaining Space */}
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
        {generatedImages && generatedImages.length > 0
          ? generatedImages.map((img, index) => (
              <img
                key={index}
                style={{
                  width: "95%",
                  objectFit: "contain",
                  maxHeight: "20vh",
                  marginBottom: "5%",
                  marginTop: "0",
                }}
                className="image-preview"
                alt=""
                src={img}
              />
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: "95%",
                  height: "20vh",
                  background: "rgba(200, 200, 200, 0.3)", // Lighter grey
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777", // Softer text color
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "5%",
                }}
              ></div>
            ))}
      </div>

      {/* Hide scrollbar for Webkit browsers (Chrome, Safari) */}
      <style>
        {`
      .image-container::-webkit-scrollbar {
        display: none;
      }
    `}
      </style>

      {/* Bottom Section with Generate Button */}
      <div style={{ width: "100%", marginTop: "auto", marginBottom: "4.5em" }}>
        <hr
          style={{
            border: "none",
            minHeight: "0.05em",
            backgroundColor: "darkgrey",
            width: "100%",
          }}
        />
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
          onClick={generateImage}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(169, 169, 169, 0.15)";
            e.target.style.color = "black";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#444";
          }}
        >
          Generate sketches
        </button>
      </div>
    </>
  );
};

export default MergePanel;
