import React, { useRef, useState, useEffect, useCallback } from "react";
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
import RecommendedKeywords from "../widgets/RecommendKeywords";

const MergeKeywords = ({stageRef}) => {
const topRef = useRef(null);
const secondRef = useRef(null);
const [topBottom, setTopBottom] = useState(0);
const [secondHeight, setSecondHeight] = useState(0);

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
      Brief: brief,
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
        data: processKeywords(selectedBoardKeywords, designDetails.objective),
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

useEffect(() => {
  if (!secondRef.current) {
    setSecondHeight(0); // fallback to 0 if second box not shown
    return;
  }

  const updateSecondHeight = () => {
    const rect = secondRef.current?.getBoundingClientRect();
    setSecondHeight(rect?.height || 0);
  };

  updateSecondHeight();

  const observer = new ResizeObserver(updateSecondHeight);
  observer.observe(secondRef.current);

  window.addEventListener("resize", updateSecondHeight);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", updateSecondHeight);
  };
}, [currGenerated, secondRef]); // runs when images update

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
          className="scrollable-container"
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
          {/* {currGenerated.map((img, index) => (
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
          ))} */}
         {Array.from({ length: 3 }).map((_, index) => (
              <div
              className="image-preview"
                key={index}
                style={{
                  width: "100%",
                  height: "17.5vh",
                  background: "rgba(200, 200, 200, 0.3)", // Lighter grey
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777", // Softer text color
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "5%",
                }}
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
