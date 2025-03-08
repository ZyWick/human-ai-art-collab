import React, { useState } from "react";
import Layout from "./layout/Layout";
import { joinRoom } from "./util/api";
import { useDispatch, useSelector } from "react-redux";
import {
  setRoomData,
  setJoined,
  setUsername,
  setRoomCode,
} from "./redux/socketSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
  updateKeywords,
} from "./redux/imageSlice";
function App() {
  const dispatch = useDispatch();
  const { username, roomCode, roomData, joined } = useSelector(
    (state) => state.socket
  );

  const joinTheRoom = async () => {
    if (!username || !roomCode) return;
    const newRoomData = await joinRoom(roomCode);
    dispatch(setRoomData(newRoomData));
    dispatch(setJoined(true));
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
        <Layout />
      )}
    </div>
  );
}

export default App;
