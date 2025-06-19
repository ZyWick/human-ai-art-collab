import React, { useMemo, useCallback } from "react";
import { useSocket } from "../../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentBoardId } from "../../redux/roomSlice";
import { selectAllBoards } from "../../redux/boardsSlice";
import "../../assets/styles/BoardsList.css";

const BoardsDropdown = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.room.roomId);
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const boardData = useSelector(selectAllBoards);

  const sortedBoards = useMemo(
    () =>
      [...boardData]
        .sort(
          (a, b) =>
            b.isStarred - a.isStarred ||
            new Date(b.updatedAt) - new Date(a.updatedAt)
        )
        .filter((b) => b._id !== currentBoardId),
    [boardData, currentBoardId]
  );

  const addNewBoard = useCallback(() => {
    socket.emit("newBoard", {
      name: "Untitled Board",
      roomId: currentRoomId,
      images: [],
      keywords: [],
      parentThreads: [],
      iterations: [],
      isStarred: false,
      isVoting: false,
    });
  }, [socket, currentRoomId]);

  const saveCopy = () => socket.emit("cloneBoard", currentBoardId);
  const loadBoard = useCallback(
    (boardId) => dispatch(setCurrentBoardId(boardId)),
    [dispatch]
  );

  //   const starBoard = useCallback((boardId) => {
  //     socket.emit("starBoard", boardId);
  //   }, [socket]);

  const deleteBoard = useCallback(() => {
    if (sortedBoards.length === 0) addNewBoard();
    socket.emit("deleteBoard", currentBoardId, currentRoomId);
  }, [socket, sortedBoards.length, currentBoardId, currentRoomId, addNewBoard]);

  return (
    <>
      <button
        onClick={addNewBoard}
        className="commonButton"
        style={{
          padding: "0.35em 0.5em",
          color: "black",
          width: "100%",
          textAlign: "left",
          fontSize: "15px",
        }}
      >
        New board
      </button>
      <div
        style={{ minHeight: "1px", width: "100%", backgroundColor: "#ccc" }}
      />
      <button
        onClick={saveCopy}
        className="commonButton"
        style={{
          padding: "0.35em 0.5em",
          color: "black",
          width: "100%",
          textAlign: "left",
          fontSize: "15px",
        }}
      >
        Duplicate board
      </button>
      <button
        onClick={deleteBoard}
        className="commonButton"
        style={{
          padding: "0.35em 0.5em",
          color: "black",
          width: "100%",
          textAlign: "left",
          fontSize: "15px",
        }}
      >
        Delete
      </button>
      {sortedBoards && sortedBoards.length > 0 && (
        <div
          style={{ minHeight: "1px", width: "100%", backgroundColor: "#ccc" }}
        />
      )}
      {sortedBoards.map(({ _id, name }) => {
        return (
          <button
            className="commonButton"
            key={_id}
            onClick={() => loadBoard(_id)}
            style={{
              padding: "0.35em 0.5em",
              color: "black",
              width: "100%",
              textAlign: "left",
              wordBreak: "normal",
              overflowWrap: "break-word",
              whiteSpace: "normal",
              fontSize: "15px",
            }}
          >
            {name}
          </button>
        );
      })}
    </>
  );
};

export default BoardsDropdown;
