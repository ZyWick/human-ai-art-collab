import React, { useState } from "react";
import Layout from "./layout/Layout";
import { joinRoom,  } from "./util/api";
import { useDispatch, useSelector } from "react-redux";
import { setUsername, setRoomCode } from "./redux/roomSlice";
import {
  setRoomId,
  setRoomName,
  setUpdatedAt,
  setCurrentBoardId,
} from "./redux/roomSlice";
import { setBoards } from "./redux/boardsSlice";

const App = () => {
  const dispatch = useDispatch();
  const [joined, setJoined] = useState(false);
  const { username, roomCode } = useSelector((state) => state.room);


  const joinTheRoom = async () => {
    if (!username || !roomCode) return;
    try {
      const newRoomData = await joinRoom(roomCode);
      if (newRoomData) {
        const { _id, name, updatedAt, boards } = newRoomData;
        dispatch(setRoomId(_id));
        dispatch(setRoomName(name));
        dispatch(setUpdatedAt(updatedAt));
        dispatch(setBoards(boards));
        dispatch(setCurrentBoardId(boards?.[0]._id));
        setJoined(true);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#D8E2DC" }}>
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
        <Layout />
      )}
    </div>
  );
};

export default App;
