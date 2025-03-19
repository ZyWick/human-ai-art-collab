import React, { useState, } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NoteKeywordInput } from "../widgets/KeywordButton";
import { useSocket } from '../../context/SocketContext'
import { selectBoardById, updateBoard } from "../../redux/boardsSlice";
import { clearAllNoteKeywordVotes } from "../../redux/roomSlice";
import { clearAllImageKeywordVotes } from "../../redux/imagesSlice";
import DisplayAllBoardImages from '../widgets/DisplayAllBoardImages'
import "../../assets/styles/Layout.css";

const MoreStuff = () => {
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [showAllBoards, setShowAllBoards] = useState(false);
  const boardId  = useSelector((state) => state.room.currentBoardId);
    const currBoard = useSelector((state) =>
      selectBoardById(state, boardId)
    );
  const socket = useSocket();
  const dispatch = useDispatch();

  const resetKeywordVotes =  () => {
    dispatch(clearAllNoteKeywordVotes())
    dispatch(clearAllImageKeywordVotes())
    socket.emit("clearKeywordVotes", boardId)
  }

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: boardId,  type, keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
     }
    socket.emit("newNoteKeyword", newKeyword)
  }

  const toggleVoting = () => {
    dispatch(updateBoard({
      id: boardId,
      changes: { isVoting: !currBoard.isVoting},
    }))
    socket.emit("toggleVoting", boardId);
  };

  return (
    <>
    {showAllBoards && (
        <div className="outside-widget boardsDisplay scrollable-container">
          <DisplayAllBoardImages currBoard={currBoard} />
        </div>
      )}
    <button
        className="outside-button showBoards"
        onClick={() => setShowAllBoards(!showAllBoards)}
      >  {showAllBoards ? ">" : "<"}
      </button>
      <button
        class="outside-button addNotes"
        onClick={() => setShowAddKeyword(!showAddKeyword)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <line
            x1="7"
            y1="7"
            x2="17"
            y2="7"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="7"
            y1="11"
            x2="14"
            y2="11"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="7"
            y1="15"
            x2="12"
            y2="15"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </button>
      <button
        className="outside-button votes"
        onClick={toggleVoting}
      > 👍
      </button>

      <button
        className="outside-button resetVotes"
        onClick={resetKeywordVotes}
      > x
      </button>


      {showAddKeyword && (
        <div className="outside-widget noteInput">
     
      <NoteKeywordInput addKeywordSelection={addKeywordSelection} />
        </div>
      )}
    </>
  );
};

export default MoreStuff;
