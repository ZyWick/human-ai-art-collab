import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import { KeywordButton } from "../widgets/KeywordButton";
import { selectBoardById } from "../../redux/boardsSlice";
import { updateKeyword, selectAllKeywords } from "../../redux/keywordsSlice";
import { selectImgGenProgressByBoardId } from "../../redux/roomSlice";
import {
  addSelectedKeyword,
  removeSelectedKeyword,
} from "../../redux/selectionSlice";
import "../../assets/styles/button.css";

const MergeKeywords = ({stageRef}) => {
const topRef = useRef(null);
const secondRef = useRef(null);
const [topBottom, setTopBottom] = useState(0);
const [hide, setHide] = useState(false)

  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const selectedKeywordIds = useSelector(
    (state) => state.selection.selectedKeywordIds
  );
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const progressItem = useSelector(selectImgGenProgressByBoardId(currentBoardId));
  const designDetails = useSelector((state) => state.room.designDetails);
  const keywords = useSelector(selectAllKeywords);
  const showColor = true;

  const selectedBoardKeywords = keywords
    .filter(
      (keyword) =>
        keyword.offsetX !== undefined && keyword.offsetY !== undefined
    )
    .filter((keyword) => selectedKeywordIds.includes(keyword._id));

  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );

  const itLength = currBoard?.iterations?.length ?? 0;
  let latestIteration = undefined;
  if (itLength > 0) {
    latestIteration = currBoard?.iterations[itLength - 1];
  }

  useEffect(() => {
    setHide(false)
  },[latestIteration])
  
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
          maxHeight: "20vh",
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
           borderBottomRightRadius: `${hide ? "0" : "8px" }`,
           borderBottomLeftRadius: `${hide ? "0" : "8px" }`
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
                fontSize="12px"
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
        <ProgressBar progressItem={progressItem}/>
        {hide && latestIteration &&
        <button className="hideButton" 
    onClick={() => setHide(false)}
    title="hide"
    style={{width: "266px", position: "absolute", 
    top: "100%",
    right: "0",
    padding: 0,
      borderTopRightRadius: "0",
       borderTopLeftRadius: "0"
    }}>   <img
            src="/icons/up.svg"
            alt="Show iterations"
            width="20"
            height="20"
            style={{transform: "scaleY(-1)"}}
          /></button>}
      </div>
     {topBottom > 0 && !hide && latestIteration && latestIteration.generatedImages && (<>
  <div
    ref={secondRef}
    style={{
      width: "240px",
      maxHeight: "55vh",
      position: "absolute",
      right: "2.5%",
      top: `${topBottom + 20}px`,
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
      padding: "13px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99,
      gap: "0.5em",
       borderBottomRightRadius: "0",
       borderBottomLeftRadius: "0"
    }}
  >
    {[...Array(3)].map((_, index) => {
      const img = latestIteration.generatedImages[index];
      return (
        <div
          key={index}
          style={{
            height: "17.5vh",
            width: "17.5vh",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fafafa"
          }}
        >
          {img ? (
            <img
              src={img}
              className="imageResult"
              alt={`Generated ${index}`}
              style={{
                maxHeight: "17.5vh",
                width: "100%",
                objectFit: "contain",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: "8px"
              }}
              title={latestIteration.prompt[index]}
            />
          ) : (
            <div
              className={progressItem ? "spinner" : "error"}
              style={{
                width: "36px",
                height: "36px",
              }}
            >
              {!progressItem && "✕"}
            </div>
          )}
        </div>
      );
    })} <button className="hideButton" 
    onClick={() => setHide(true)}
    title="hide"
    style={{width: "266px", position: "absolute", 
    top: "100%",
    padding: 0,
      borderTopRightRadius: "0",
       borderTopLeftRadius: "0"
    }}>   <img
            src="/icons/up.svg"
            alt="Show iterations"
            width="20"
            height="20"
          /></button>
  
  </div>
 </>
)}
    </>
  );
};


function ProgressBar({progressItem}) {

  return progressItem && <div style={{position: "absolute", right: "13px", top: "96%", width: `calc(100% - 26px)`}}>
    <p
    style= {{
      color: "rgb(68,68,68)",
      marginTop: "0",
      marginBottom: "0",
      fontSize: "10px",
      textAlign: "left",
      whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    }}
    > </p>
    <div style={{
      width: '100%',
      height: '2px',
    }}>
      <div style={{ height: '100%',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease-in-out', width: `${progressItem.progress}%` }} />
    </div></div>
  ;
}

const insertColorInFilename = (url) => {
  return url.replace(/(\.[^/.]+)$/, '_color$1');
};

export default MergeKeywords;
