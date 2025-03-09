import React, { useState } from "react";
import Layout from "./layout/Layout";
import { joinRoom } from "./util/api";
import { useDispatch, useSelector } from "react-redux";
import {
  setUsername,
  setRoomId,
  setRoomName,
  setRoomCode,
  setUpdatedAt,
  setCurrentBoardId,
  setBoardNoteKeywords,
  resetRoomState,
} from "./redux/roomSlice";
import { setBoards, resetBoardState } from "./redux/boardSlice";
import { setImages, resetImagesState } from "./redux/imagesSlice";

function App() {
  const dispatch = useDispatch();
  const [joined, setJoined] = useState(false);
  const { username, roomCode } = useSelector((state) => state.room);

  const joinTheRoom = async () => {
    if (!username || !roomCode) return;
    const newRoomData = await joinRoom(roomCode);
    console.log(newRoomData);
    dispatch(setRoomId(newRoomData._id));
    dispatch(setRoomName(newRoomData.name));
    dispatch(setUpdatedAt(newRoomData.updatedAt));
    const boards = newRoomData.boards;
    dispatch(setBoards(boards));
    const initialBoard = boards[boards.length - 1];
    dispatch(setCurrentBoardId(initialBoard._id));
    dispatch(setBoardNoteKeywords(initialBoard.keywords));
    dispatch(setImages(initialBoard.images));
    setJoined(true);
  };

  const handleBack = () => {
    // Reset all relevant states
    dispatch(resetRoomState());
    dispatch(resetBoardState());
    dispatch(resetImagesState());
    setJoined(false);
  };

  return (
    <div style={{ backgroundColor: "lightgray" }}>
      {!joined ? (
        <div>
          <h1>Join a Moodboard Session</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => dispatch(setUsername(e.target.value))}
          />
          <input
            type="text"
            placeholder="Enter moodboard room name"
            value={roomCode}
            onChange={(e) => dispatch(setRoomCode(e.target.value))}
          />
          <button onClick={joinTheRoom}>Join</button>
        </div>
      ) : (
        <Layout onBack={handleBack} />
      )}
    </div>
  );
}

export default App;