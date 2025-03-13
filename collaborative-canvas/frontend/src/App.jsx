import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import { joinRoom, createRoom } from "./util/api";
import { useDispatch, useSelector } from "react-redux";
import { setUsername, setRoomCode } from "./redux/roomSlice";
import {
  setRoomId,
  setRoomName,
  setUpdatedAt,
  setCurrentBoardId,
  setDesignDetails,
  setRoomChat
} from "./redux/roomSlice";
import { setBoards } from "./redux/boardsSlice";
import './App.css';
import { AuthProvider } from "./context/AuthContext";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Login from "./components/Login"; // Ensure the correct path
import { useAuth } from "./context/AuthContext"; // Ensure you import `useAuth`

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<FrontPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route 
          path="/room/:roomCode" 
          element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          }
        />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
            
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// PrivateRoute Component: Protects routes for authenticated users
const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Get authentication state
  return user ? children : <Navigate to="/login" />; // Redirect to login if not authenticated
};

// FrontPage Component: Shows Login and Signup options
const FrontPage = () => {
  return (
    <div>
      <h1>Welcome to Collaborative Canvas</h1>
      <div>
        <a href="/login">Login</a>
        <a href="/register">Signup</a>
      </div>
    </div>
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
        const { _id, name, updatedAt, boards, roomChat } = newRoomData;
        dispatch(setRoomId(_id));
        console.log(roomChat)
        dispatch(setRoomChat(roomChat))
        dispatch(setRoomName(name));
        dispatch(setUpdatedAt(updatedAt));
        dispatch(setBoards(boards));
        dispatch(setCurrentBoardId(boards?.[boards.length - 1]._id));
        dispatch(setDesignDetails(newRoomData?.designDetails))
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

  const { logout } = useAuth(); // Get logout function
  const { Profile } = useAuth(); // Get Profile function

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
      <button onClick={logout}>Logout</button>
      </div>
      {/*<button onClick={() => navigate("/profile")}>Profile</button>*/}
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