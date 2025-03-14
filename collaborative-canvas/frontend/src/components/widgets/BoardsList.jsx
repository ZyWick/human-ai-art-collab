import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { setCurrentBoardId } from "../../redux/roomSlice";
import { updateBoard } from "../../redux/boardsSlice";
import { selectAllBoards,  } from "../../redux/boardsSlice";
import '../../assets/styles/BoardsList.css'

const BoardsList = ({ addNewBoard }) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const boardData = useSelector(selectAllBoards)  
  const [hoveredBoardId, setHoveredBoardId] = useState(null); 

  const sortedBoards = useMemo(() => {
    return [...boardData].sort((a, b) => {
      if (a.isStarred !== b.isStarred) return b.isStarred - a.isStarred;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [boardData]);
  

  const loadBoard = (boardId) => {
    dispatch(setCurrentBoardId(boardId));
  };

  const starBoard = (boardId, isStarred) => {
    dispatch(updateBoard({
      id: boardId,
      changes: { isStarred: !isStarred},
    }))
    socket.emit("starBoard", boardId);
  };

  
  const deleteBoard = (boardId, roomId) => {
    if (sortedBoards.length === 1)
      addNewBoard()
    socket.emit("deleteBoard", boardId, roomId);
  };

  return (
    <>
      {sortedBoards.map((board) => (
        <div
          key={board._id}
          className="board-container"
          onClick={() => loadBoard(board._id)}
          onMouseEnter={() => setHoveredBoardId(board._id)}
          onMouseLeave={() => setHoveredBoardId(null)}
        >
          {hoveredBoardId === board._id && (
            <>
              {!board.isStarred && (
                <button
                  disabled={hoveredBoardId !== board._id}
                  className="star-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    starBoard(board._id, board.isStarred);
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                disabled={hoveredBoardId !== board._id}
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBoard(board._id, board.roomId);
                }}
              >
                <strong>x</strong>
              </button>
            </>
          )}
          {board.isStarred && (
            <button
              disabled={hoveredBoardId !== board._id}
              className="star-button filled"
              onClick={(e) => {
                e.stopPropagation();
                starBoard(board._id, board.isStarred);
              }}
            >
              <svg width="48" height="48" viewBox="-5 -5 34 34" fill="gold" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="black" floodOpacity="0.3" />
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
          {board.generatedImages?.length ? (
            <img className="image-preview" alt="" src={board.generatedImages[0]} />
          ) : (
            <div className="image-placeholder">No generated image</div>
          )}
          {board.name}
        </div>
      ))}
    </>
  );
};

export default BoardsList;