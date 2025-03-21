import { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { setCurrentBoardId } from "../../redux/roomSlice";
import { updateBoard, selectAllBoards } from "../../redux/boardsSlice";
import "../../assets/styles/BoardsList.css";

const BoardsList = ({ addNewBoard }) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const boardData = useSelector(selectAllBoards);
  const [hoveredBoardId, setHoveredBoardId] = useState(null);

  const sortedBoards = useMemo(
    () =>
      [...boardData].sort(
        (a, b) =>
          b.isStarred - a.isStarred || new Date(b.updatedAt) - new Date(a.updatedAt)
      ),
    [boardData]
  );

  const loadBoard = useCallback((boardId) => {
    dispatch(setCurrentBoardId(boardId));
  }, [dispatch]);

  const starBoard = useCallback(
    (boardId, isStarred) => {
      dispatch(updateBoard({ id: boardId, changes: { isStarred: !isStarred } }));
      socket.emit("starBoard", boardId);
    },
    [dispatch, socket]
  );

  const deleteBoard = useCallback(
    (boardId, roomId) => {
      if (sortedBoards.length === 1) addNewBoard();
      socket.emit("deleteBoard", boardId, roomId);
    },
    [socket, sortedBoards.length, addNewBoard]
  );

  return (
    <>
      {sortedBoards.map(({ _id, name, isStarred, updatedAt, iterations, roomId }) => {
        const lastIteration = iterations?.[iterations.length - 1];
        const generatedImage = lastIteration?.generatedImages?.[0];

        return (
          <div
            key={_id}
            className="board-container"
            onClick={() => loadBoard(_id)}
            onMouseEnter={() => setHoveredBoardId(_id)}
            onMouseLeave={() => setHoveredBoardId(null)}
          >
            {hoveredBoardId === _id && (
              <>
                {!isStarred && (
                  <button
                    className="star-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      starBoard(_id, isStarred);
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBoard(_id, roomId);
                  }}
                >
                  <strong>x</strong>
                </button>
              </>
            )}
            {isStarred && (
              <button
                className="star-button filled"
                onClick={(e) => {
                  e.stopPropagation();
                  starBoard(_id, isStarred);
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="-5 -5 34 34"
                  fill="gold"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
            {generatedImage ? (
              <img className="image-preview" alt="Generated" src={generatedImage} />
            ) : (
              <div className="image-placeholder">No generated image</div>
            )}
            {name}
          </div>
        );
      })}
    </>
  );
};

export default BoardsList;
