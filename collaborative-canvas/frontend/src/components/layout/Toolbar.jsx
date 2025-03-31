import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
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


const Toolbar = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();

  const [showAllIterations, setShowAllIterations] = useState(false);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const isVoting = currBoard?.isVoting;  
  const selectedKeywordIds = useSelector(
    (state) => state.selection.selectedKeywordIds
  );
  const keywords = useSelector(selectAllKeywords) 

  const boardKeywords = useMemo(
    () => keywords.filter((kw) => kw.offsetX !== undefined && kw.offsetY !== undefined),
    [keywords]
  );
  const selectedKeywords = useMemo(
    () => keywords.filter((kw) => selectedKeywordIds.includes(kw._id) && kw.offsetX !== undefined && kw.offsetY !== undefined),
    [keywords, selectedKeywordIds]
  );
  
  const filterdata = useCallback(
    (metadataArray) => metadataArray.map(({ keyword, type }) => ({ keyword, type })),
    []
  );

  useEffect(() => {
    if (boardKeywords.length) {
      socket.emit("recommendFromBoardKw", { boardId, keywords: filterdata(boardKeywords) });
    }
  }, [socket, boardId, boardKeywords, filterdata]);

  useEffect(() => {
    if (selectedKeywords.length) {
      socket.emit("recommendFromSelectedKw", { boardId, keywords: filterdata(selectedKeywords) });
    }
  }, [socket, boardId, selectedKeywords, filterdata]);

  const { boardRecommendedKeywords = [], selectedRecommendedKeywords = [] } = currBoard || {};

  const addKeywordSelection = useCallback(
    (type, newKeywordText) => {
      socket.emit("newKeyword", {
        boardId,
        type,
        keyword: newKeywordText,
        offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
        offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
      });
    },
    [boardId, socket]
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

  const handleClickRecomKw = useCallback(
    (from, keyword, type) => {
      addKeywordSelection(type, keyword);
      const updatedKeywords =
        from === "board"
          ? boardRecommendedKeywords.filter((k) => k.type !== type || k.keyword !== keyword)
          : selectedRecommendedKeywords.filter((k) => k.type !== type || k.keyword !== keyword);

      dispatch(updateBoard, { id: boardId, changes: { [`${from}RecommendedKeywords`]: updatedKeywords } });
    },
    [dispatch, boardId, addKeywordSelection, boardRecommendedKeywords, selectedRecommendedKeywords]
  );

  return (
    <>
      {showAllIterations && <IterationsPopup currBoard={currBoard} setShowAllIterations={setShowAllIterations} />}


      <div className="toolbar" style={{ boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)" }}>
        {/* Toolbar Controls */}
        <div className="toolbar-group" style={{ display: "flex", flexDirection: "column", width: "100px", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button onClick={handleToggleComments} title="Add Comment" className={isAddingComments ? "active" : ""}>
              🗨️
            </button>
            <button
              onClick={handleToggleIterations}
              title={showAllIterations ? "Hide Iterations" : "Show Iterations"}
              className={showAllIterations ? "active" : ""}
            >
              {showAllIterations ? "📂" : "📌"}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: "0.5em", paddingRight: "0.75em", width: "100%" }}>
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
        {boardRecommendedKeywords && boardRecommendedKeywords.length > 0 &&
          boardRecommendedKeywords.map((keyword, i) => (
            <KeywordButton
            style={{fontSize: "12px"}}
              key={i}
              text={keyword.keyword}
              type={keyword.type}
              isSelected={false}
              onClick={() => {
                handleClickRecomKw ("board", keyword.keyword, keyword.type)
              }}
            />
          ))
        }
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
        {selectedRecommendedKeywords && selectedRecommendedKeywords.length > 0 &&
          selectedRecommendedKeywords.map((keyword, i) => (
            <KeywordButton
            style={{fontSize: "12px"}}
              key={i}
              text={keyword.keyword}
              type={keyword.type}
              isSelected={false}
              onClick={() => {
                handleClickRecomKw ("selected", keyword.keyword, keyword.type)
              }}
            />
          ))
        }
      </div>
        </div>

      </div>
    </>
  );
};

export default Toolbar;
