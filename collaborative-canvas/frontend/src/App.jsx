import React, { useState } from "react";
import Layout from "./layout/Layout";
import { joinRoom, createRoom } from "./util/api";
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
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
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
        dispatch(setCurrentBoardId(boards?.[boards.length - 1]._id));
        setJoined(true);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const createTheRoom = async () => {
    if (!roomCode) return; 
    try {
      const newRoomData = await createRoom(roomCode);
      if (newRoomData) {
        const { _id, name, updatedAt, boards } = newRoomData;
        dispatch(setRoomId(_id));
        dispatch(setRoomName(name));
        dispatch(setUpdatedAt(updatedAt));
        dispatch(setBoards(boards));
        alert("Room created successfully!");
        dispatch(setCurrentBoardId(boards?.[boards.length - 1]._id));
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div style={{width: "100vw", 
    height:"100vh", 
    maxWidth: "100vw", 
    maxHeight:"100vh", 
    overflow: "hidden",}}
    className="app-container">
      {!joined ? (
        <div className="form-container">
          <h1>{isCreatingRoom ? "Create a Moodboard Session" : "Join a Moodboard Session"}</h1>
          
          {/* Show username input only when joining a room */}
          {!isCreatingRoom && (
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => dispatch(setUsername(e.target.value))}
            />
          )}

          {/* Always show room name input */}
          <input
            type="text"
            placeholder="Enter moodboard room name"
            value={roomCode}
            onChange={(e) => dispatch(setRoomCode(e.target.value))}
          />

          {/* Show appropriate button based on mode */}
          {isCreatingRoom ? (
            <button onClick={createTheRoom}>Create Room</button>
          ) : (
            <button onClick={joinTheRoom}>Join Room</button>
          )}

          {/* Toggle between create and join modes */}
          <button onClick={() => setIsCreatingRoom(!isCreatingRoom)}>
            {isCreatingRoom ? "Switch to Join Room" : "Switch to Create Room"}
          </button>
        </div>
      ) : (
        <Layout />
      )}
    </div>
  );
};

export default App;