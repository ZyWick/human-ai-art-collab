import React, { useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById, updateBoard } from "../../redux/boardsSlice";
import { clearAllVotes } from "../../redux/keywordsSlice";
import { setIsAddingComments } from "../../redux/roomSlice";
import DisplayIterations from "../widgets/DisplayIterations";
import "../../assets/styles/toolbar.css";

const Toolbar = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  
  const [showAllIterations, setShowAllIterations] = useState(false);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));
  const isAddingComments = useSelector((state) => state.room.isAddingComments);

  const isVoting = useMemo(() => currBoard?.isVoting, [currBoard]);

  const handleResetVotes = useCallback(() => {
    dispatch(clearAllVotes());
    socket.emit("clearKeywordVotes", boardId);
  }, [dispatch, socket, boardId]);

  const handleToggleVoting = useCallback(() => {
    dispatch(updateBoard({ id: boardId, changes: { isVoting: !isVoting } }));
    socket.emit("toggleVoting", boardId);
  }, [dispatch, socket, boardId, isVoting]);

  const handleToggleComments = useCallback(() => {
    dispatch(setIsAddingComments(!isAddingComments));
  }, [dispatch, isAddingComments]);

  const handleToggleIterations = useCallback(() => {
    setShowAllIterations((prev) => !prev);
  }, []);

  return (
    <>
      {showAllIterations && (
        <div className="outside-widget boardsDisplay scrollable-container">
          <DisplayIterations currBoard={currBoard} />
        </div>
      )}

      <div className="toolbar">
        {/* Adding Comments */}
        <div className="toolbar-group">
          <button 
            onClick={handleToggleComments} 
            title="Add Comment"
            className={isAddingComments ? "active" : ""}
          >
            🗨️
          </button>
        </div>

        {/* Voting */}
        <div className="toolbar-group">
          <button 
            onClick={handleToggleVoting} 
            title="Vote" 
            className={isVoting ? "active" : ""}
          >
            👍
          </button>
          <button className="resetVotesIcon" onClick={handleResetVotes} title="Reset Votes">
            ↻
          </button>
        </div>

        {/* Iterations Toggle */}
        <div className="toolbar-group">
          <button 
            onClick={handleToggleIterations} 
            title={showAllIterations ? "Hide Iterations" : "Show Iterations"}
            className={showAllIterations ? "active" : ""}
          >
            {showAllIterations ? "📂" : "📌"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
