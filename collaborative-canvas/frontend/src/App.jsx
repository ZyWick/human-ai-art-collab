import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from "react-router-dom";
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
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Front page */}
        <Route path="/room/:roomCode" element={<RoomPage />} /> {/* Room page */}
      </Routes>
    </Router>
  );
};

// HomePage Component (Front Page)
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
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
        navigate(`/room/${roomCode}`); // Redirect to the room URL
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
        navigate(`/room/${roomCode}`); // Redirect to the room URL
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div style={{ 
    width: "100vw", 
    height: "100vh",
    maxWidth: "100vw", 
    maxHeight: "100vh", 
    overflow: "hidden" }}
    className="app-container">
      <div className="form-container">
      <h1>{isCreatingRoom ? "Create a Moodboard Session" : "Join a Moodboard Session"}</h1>
      {!isCreatingRoom && (
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => dispatch(setUsername(e.target.value))}
        />
      )}
      <input
        type="text"
        placeholder="Enter moodboard room name"
        value={roomCode}
        onChange={(e) => dispatch(setRoomCode(e.target.value))}
      />
      {isCreatingRoom ? (
        <button onClick={createTheRoom}>Create Room</button>
      ) : (
        <button onClick={joinTheRoom}>Join Room</button>
      )}
      <button onClick={() => setIsCreatingRoom(!isCreatingRoom)}>
        {isCreatingRoom ? "Switch to Join Room" : "Switch to Create Room"}
      </button>
      </div>
    </div>
  );
};

// RoomPage Component (Room Page)
const RoomPage = () => {
  const { roomCode } = useParams(); // Get roomCode from the URL
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch room data when the component mounts
    const fetchRoomData = async () => {
      try {
        const newRoomData = await joinRoom(roomCode);
        if (newRoomData) {
          const { _id, name, updatedAt, boards } = newRoomData;
          dispatch(setRoomId(_id));
          dispatch(setRoomName(name));
          dispatch(setUpdatedAt(updatedAt));
          dispatch(setBoards(boards));
          dispatch(setCurrentBoardId(boards?.[boards.length - 1]._id));
        }
      } catch (error) {
        console.error("Failed to join room:", error);
        navigate("/"); // Redirect to the home page if the room doesn't exist
      }
    };

    fetchRoomData();
  }, [roomCode, dispatch, navigate]);

  return (
    <div style={{ width: "100vw", height: "100vh", maxWidth: "100vw", maxHeight: "100vh", overflow: "hidden" }}>
      <Layout />
    </div>
  );
};

export default App;