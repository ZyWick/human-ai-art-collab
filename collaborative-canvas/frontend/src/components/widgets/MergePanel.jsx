import React, {useCallback} from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import { KeywordButton } from "./KeywordButton";
import { selectBoardById } from "../../redux/boardsSlice";
import { updateKeyword, selectAllKeywords } from "../../redux/keywordsSlice";
import {
  addSelectedKeyword,
  removeSelectedKeyword,
} from "../../redux/selectionSlice";

const MergePanel = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const selectedKeywordIds = useSelector(
    (state) => state.selection.selectedKeywordIds
  );
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const designDetails = useSelector((state) => state.room.designDetails);
  const keywords = useSelector(selectAllKeywords);

  const selectedBoardKeywords = keywords
    .filter(
      (keyword) =>
        keyword.offsetX !== undefined && keyword.offsetY !== undefined
    )
    .filter((keyword) => selectedKeywordIds.includes(keyword._id));

  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );

  const itLength = currBoard?.iterations?.length ?? 0; // Ensure it's a number
  let currGenerated = undefined; // Declare variable outside if-block
  if (itLength > 0) {
    const latestIteration = currBoard?.iterations[itLength - 1];
    currGenerated = latestIteration?.generatedImages; // Assign inside the block
  }

  const normalizeType = (type) => {
  const map = {
    "subject matter": "Subject matter",
    "action & pose": "Action & pose",
    "theme & mood": "Theme & mood",
  };
  return map[type.trim().toLowerCase()];
};

    const processKeywords = useCallback((keywords, brief) => {
      const result = {
        "Subject matter": {},
        "Action & pose": {},
        "Theme & mood": {},
        "Brief": brief,
      };
      
      keywords.forEach(({ type, keyword, votes, downvotes }) => {
        const normalized = normalizeType(type);
        if (normalized) {
          result[normalized][keyword.trim()] = votes.length - downvotes.length;
        }
      });
  
      return result;
    }, []);

  const generateImage = () => {
    if (selectedBoardKeywords?.length > 0)
      socket.emit("generateNewImage", {
        boardId: currentBoardId,
        data: processKeywords(selectedBoardKeywords, designDetails.objective)
      });
  };

  const toggleSelected = (keyword) => {
    const newIsSelected = !keyword.isSelected;
    const update = { id: keyword._id, changes: { isSelected: newIsSelected } };
    dispatch(updateKeyword, update);
    dispatch(
      newIsSelected ? addSelectedKeyword : removeSelectedKeyword,
      keyword._id
    );
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

      {/* Image Container - Takes Up Remaining Space */}
      <div
        style={{
          marginTop: "1em",
          paddingTop: "1em",
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
            "inset 0 4px 6px -4px rgba(0,0,0,0.2)",
            "inset 0 -4px 6px -4px rgba(0,0,0,0.2)",
            "inset 1px 0 2px -1px rgba(0,0,0,0.01)",
            "inset -1px 0 2px -1px rgba(0,0,0,0.01)",
          ].join(", "),
        }}
        className="image-container"
      >
        {currGenerated && currGenerated.length > 0
          ? currGenerated.map((img, index) => (
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
      {/* </div> */}
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
        {/* <hr
          style={{
            border: "none",
            minHeight: "0.05em",
            backgroundColor: "darkgrey",
            width: "100%",
          }}
        /> */}
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
            e.target.style.background = "rgba(92, 84, 84, 0.15)";
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
