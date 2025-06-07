import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import { KeywordButton } from "../widgets/KeywordButton";
import { selectBoardById } from "../../redux/boardsSlice";
import { updateKeyword, selectAllKeywords } from "../../redux/keywordsSlice";
import {
  addSelectedKeyword,
  removeSelectedKeyword,
} from "../../redux/selectionSlice";
import "../../assets/styles/button.css";

const MergeKeywords = ({stageRef}) => {
const topRef = useRef(null);
const secondRef = useRef(null);
const [topBottom, setTopBottom] = useState(0);

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

const typeMap = useMemo(() => ({
  "subject matter": "Subject matter",
  "action & pose": "Action & pose",
  "theme & mood": "Theme & mood",
}), []);

const processKeywords = useCallback((keywords, brief) => {
  const normalizeType = (type) => {
    return typeMap[type.trim().toLowerCase()];
  };

  const result = {
    "Subject matter": {},
    "Action & pose": {},
    "Theme & mood": {},
    Brief: brief,
  };

  keywords.forEach(({ type, keyword, votes, downvotes }) => {
    const normalized = normalizeType(type);
    if (normalized) {
      const key = keyword.trim();
      const score = (votes?.length || 0) - (downvotes?.length || 0);
      result[normalized][key] = score;
    }
  });

  return result;
}, [typeMap]);



function filterArrangementData(data) {
  return data
    .filter(item => item.type === "Arrangement")
    .map(item => ({
      boundingBoxes: item.boundingBoxes,
      votes: (item.votes?.length || 0) - (item.downvotes?.length || 0),
    }));
}
const generateImage = () => {
      console.log("hello2")
  if (selectedBoardKeywords?.length > 0) {
    const dataKeywords = processKeywords(selectedBoardKeywords, designDetails.objective);

    // Check if at least one keyword exists in any category
    const hasKeywords = ["Subject matter", "Action & pose", "Theme & mood"]
      .some(category => Object.keys(dataKeywords[category]).length > 0);

    if (hasKeywords) {
      socket.emit("generateNewImage", {
        boardId: currentBoardId,
        data: dataKeywords,
        arrangement: filterArrangementData(selectedBoardKeywords),
      });
    }
  }
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

  useEffect(() => {
  const element = topRef.current;
  if (!element) return;

  const updatePosition = () => {
    const rect = element.getBoundingClientRect();
    setTopBottom(rect.bottom);
  };

  updatePosition();

  const observer = new ResizeObserver(updatePosition);
  observer.observe(element);
  window.addEventListener("resize", updatePosition);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", updatePosition);
  };
}, []);

  return (
    <>
      <div
        ref={topRef}
        style={{
          position: "absolute",
          width: "240px",
          maxHeight: "25vh",
          right: "2.5%",
          top: "10%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
          padding: "13px",
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
          zIndex: "100",
        }}
      >
        <div
          className="scrollable-container"
          style={{
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
            <div
              style={{
                marginTop: "0.55em",
                fontSize: "0.75em",
                color: "rgb(68,68,68)",
              }}
            >
              selected keywords appear here
            </div>
          )}
        </div>
        <button className="wideButton" onClick={generateImage}>
          Merge Keywords
        </button>
      </div>
      {topBottom > 0 && currGenerated && currGenerated.length > 0 && (
        <div
        ref={secondRef}
          style={{
           width: "240px",
            maxHeight: "52.5vh",
            position: "absolute",
            right: "2.5%",
            top: `${topBottom + 20}px`, // 10px spacing below first box
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
            padding: "13px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center" /* centers vertically */,
            alignItems: "center",
            zIndex: 99,
            gap: "0.5em",
          }}
        >
          {currGenerated.map((img, index) => (
            <img
              key={index}
              style={{
                width: "100%",
                objectFit: "contain",
                maxHeight: "17.5vh",
              }}
              className="image-preview"
              alt=""
              src={img}
            />
          ))}
      
        </div>
      )}
      {/* <div
        style={{
            position: "absolute",
            right: "2.5%",
            top: `${topBottom + 20 + (currGenerated?.length > 0 ? secondHeight + 20 : 0)}px`,
          maxWidth: "240px",
          minWidth: "240px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
            padding: "13px",
            zIndex: 100,
            display:"flex",
            flexDirection: "column",
            justifyContent: "space-between"
  }}
>
 <RecommendedKeywords stageRef={stageRef}/>
</div> */}

    </>
  );
};

export default MergeKeywords;
