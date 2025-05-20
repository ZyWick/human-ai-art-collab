import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Konva from "konva";
import { debounce,  } from 'lodash';
import _ from 'lodash';
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import useRandomStageCoordinates from "../../hook/useRandomStageCoordinates";
import { useSocket } from "../../context/SocketContext";
import {
  selectBoardById,
  updateBoard,
} from "../../redux/boardsSlice";
import {
  clearAllVotes,
  selectAllKeywords,
} from "../../redux/keywordsSlice";
import { setIsAddingComments } from "../../redux/roomSlice";
import { KeywordButton } from "../widgets/KeywordButton";
import IterationsPopup from "../widgets/IterationsPopup";
import "../../assets/styles/toolbar.css";

const DEBOUNCE_DELAY = 2500
const summarizeKeywords = (list) =>
  _.sortBy(
    list
      .filter(({ offsetX, offsetY }) => offsetX !== undefined && offsetY !== undefined)
      .map(({ _id, keyword, type, votes = [], downvotes = [] }) => ({
        _id,
        keyword,
        type,
        votes: votes.length - downvotes.length,
      })),
    "_id"
  );

const normalizeType = (type) => {
  const map = {
    "subject matter": "Subject matter",
    "action & pose": "Action & pose",
    "theme & mood": "Theme & mood",
  };
  return map[type.trim().toLowerCase()];
};

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const Toolbar = ({stageRef}) => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const getRandomCoordinates = useRandomStageCoordinates(stageRef);

  const [showAllIterations, setShowAllIterations] = useState(false);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const isVoting = currBoard?.isVoting;  
  const selectedKeywordIds = useSelector(
    (state) => state.selection.selectedKeywordIds
  );
  const designDetails = useSelector((state) => state.room.designDetails);
  const keywords = useSelector(selectAllKeywords) 
  

  const handleBackToOrigin = () => {
    const stage = stageRef.current;
    stage.to({
      x: 0,
      y: 0,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });
  };

  const processKeywords = useCallback((keywords, brief) => {
    const result = {
      "Subject matter": {},
      "Action & pose": {},
      "Theme & mood": {},
      "Brief": brief,
    };
    
    keywords.forEach(({ type, keyword, votes }) => {
      const normalized = normalizeType(type);
      if (normalized) {
        result[normalized][keyword.trim()] = votes;
      }
    });

    return result;
  }, []);

  const debouncedEmitBoardKw = useMemo(() =>
    debounce((keywords) => {
      const data = processKeywords(keywords, designDetails.objective);
      socket.emit("recommendFromBoardKw", { boardId, data });
    }, DEBOUNCE_DELAY),
    [socket, boardId, designDetails.objective, processKeywords]
  );

  const debouncedEmitSelectedKw = useMemo(() =>
    debounce((keywords) => {
      const data = processKeywords(keywords, designDetails.objective);
      socket.emit("recommendFromSelectedKw", { boardId, data });
    }, DEBOUNCE_DELAY),
    [socket, boardId, designDetails.objective, processKeywords]
  );

  useEffect(() => {
    return () => {
      debouncedEmitBoardKw.cancel();
      debouncedEmitSelectedKw.cancel();
    };
  }, [debouncedEmitBoardKw, debouncedEmitSelectedKw]);

  // Board keywords effect
  const summarizedKeywords = summarizeKeywords(keywords);
  const prevBoard = usePrevious(summarizedKeywords);

  useEffect(() => {
    if (!_.isEqual(prevBoard, summarizedKeywords)) {
      // debouncedEmitBoardKw(summarizedKeywords);
    }
  }, [summarizedKeywords, prevBoard, debouncedEmitBoardKw]);

  // Selected keywords effect
  const selectedSummarized = summarizeKeywords(
    keywords.filter((kw) => selectedKeywordIds.includes(kw._id))
  );
  const prevSelected = usePrevious(selectedSummarized);
 
  useEffect(() => {
    if (!_.isEqual(prevSelected, selectedSummarized)) {
      debouncedEmitSelectedKw(selectedSummarized);
    }
  }, [selectedSummarized, prevSelected, debouncedEmitSelectedKw]);


  const addKeywordSelection = useCallback(
    (type, newKeywordText) => {
      const { x, y } = getRandomCoordinates();
      socket.emit("newKeyword", {
        boardId,
        type,
        keyword: newKeywordText,
        offsetX: x,
        offsetY: y,
      });
    },
    [boardId, socket, getRandomCoordinates]
  );

  const handleResetVotes = useCallback(() => {
    dispatch(clearAllVotes, {});
    socket.emit("clearKeywordVotes", boardId);
  }, [dispatch, socket, boardId]);
  
  const handleToggleVoting = useCallback(() => {
    dispatch(updateBoard, { id: boardId, changes: { isVoting: !isVoting } });
    socket.emit("toggleVoting", boardId);
  }, [dispatch, socket, boardId, isVoting]);
  
  const handleToggleComments = useCallback(() => {
    dispatch(setIsAddingComments, !isAddingComments);
  }, [dispatch, isAddingComments]);

  const handleToggleIterations = useCallback(() => {
    setShowAllIterations((prev) => !prev);
  }, []);

  let { boardRecommendedKeywords = [], selectedRecommendedKeywords = [] } = currBoard || {};

  const handleClickRecomKw = useCallback(
  (from, keyword, type) => {
    addKeywordSelection(type, keyword);

    const sourceKeywords =
      from === "board" ? boardRecommendedKeywords : selectedRecommendedKeywords;

    const updatedKeywords = {
      ...sourceKeywords,
      [type]: sourceKeywords[type]?.filter(k => k !== keyword) || []
    };

    dispatch(updateBoard, {
      id: boardId,
      changes: { [`${from}RecommendedKeywords`]: updatedKeywords }
    });
  },
  [dispatch, boardId, addKeywordSelection, boardRecommendedKeywords, selectedRecommendedKeywords]
);


  return (
    <>
      {showAllIterations && <IterationsPopup currBoard={currBoard} setShowAllIterations={setShowAllIterations} />}


      <div className="toolbar" style={{ boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)" }}>
        {/* Toolbar Controls */}
        <div className="toolbar-group" style={{ display: "flex", flexDirection: "column", width: "130px", gap: "0px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          
          <button
            onClick={handleBackToOrigin}
            title="Back to Origin"
            style={{
              paddingTop: '12px',
              paddingInline: "7px",
              margin: "0",
            }}
          >
            <img src="/icons/crosshair.svg" alt="Back to Origin" width="30" height="30" />
          </button>
              <button onClick={handleToggleComments} title="Add Comment" 
              className={isAddingComments ? "active" : ""}
              style={{
                paddingTop: '12px',
              }}
              >
              <img src="/icons/sticky-notes.svg" alt="Add Comment" width="20" height="20" />
            </button>
            <button
              onClick={handleToggleIterations}
              title={showAllIterations ? "Hide Iterations" : "Show Iterations"}
              className={showAllIterations ? "active" : ""}
            >
              {/* {showAllIterations ? "📂" : "📂"} */}
              📂
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", paddingLeft: "0.5em", paddingRight: "0.75em", width: "100%" }}>
            <button onClick={handleToggleVoting} title="Vote" className={isVoting ? "active" : ""}>
              👍
            </button>
            <button className="resetVotesIcon" onClick={handleResetVotes} title="Reset Votes">
              ↻
            </button>
          </div>
        </div>

        <div className="toolbar-group" style={{ maxHeight: "100%", minWidth: "240px", gap: "0.3em", flexDirection: "column"}}>
          <span style={{fontSize: "0.7em", color: "grey"}}>related to your keywords</span>
          <div
          className="scrollable-container"
        style={{
          width: "80%",
          maxHeight: "5%",
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          flexWrap: "wrap",
          gap: "0.2em",
          fontSize: "20px",
        }}
      >
        {boardRecommendedKeywords &&
  Object.entries(boardRecommendedKeywords).map(([type, keywords]) =>
    keywords.map((keyword, i) => (
      <KeywordButton
        key={`${type}-${i}`}
        style={{ fontSize: "12px" }}
        text={keyword}
        type={type}
        isSelected={false}
        onClick={() => {
          handleClickRecomKw("board", keyword, type);
        }}
      />
    ))
  )}
        
      </div>
        </div>

        {/* Iterations Toggle */}
        <div className="toolbar-group" style={{ maxHeight: "100%", minWidth: "240px", gap: "0.3em", flexDirection: "column"}}>
          <span style={{fontSize: "0.7em", color: "grey"}}>related to selected keywords</span>
          <div
          className="scrollable-container"
        style={{
          width: "80%",
          maxHeight: "5%",
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          flexWrap: "wrap",
          gap: "0.2em",
          fontSize: "20px",
        }}
      >
{selectedRecommendedKeywords &&
  Object.entries(selectedRecommendedKeywords).map(([type, keywords]) =>
    keywords.map((keyword, i) => (
      <KeywordButton
        key={`${type}-${i}`}
        style={{ fontSize: "12px" }}
        text={keyword}
        type={type}
        isSelected={false}
        onClick={() => {
          handleClickRecomKw("selected", keyword, type);
        }}
      />
    ))
  )}

      </div>
        </div>

      </div>
    </>
  );
};

export default Toolbar;
