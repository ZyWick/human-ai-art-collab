import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { joinRoomService, createRoomService } from "../util/roomService";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuth();
  const [newRoomCode, setNewRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = () => {
    if (!newRoomCode) return;
    createRoomService(newRoomCode, dispatch, navigate);
    setNewRoomCode(""); // Clear input after creating room
  };

  const handleJoinRoom = () => {
    if (!joinCode);
    joinRoomService(joinCode, dispatch, navigate);
    setJoinCode("");
  };

  return (
    <div className="app-container">
      <h1>Moodboard Sessions</h1>

      <div className="cards-container">
        {/* Create Room Card */}
        <div className="card">
          <h2>Create a New Room</h2>
          <input
            type="text"
            placeholder="Enter moodboard room name"
            value={newRoomCode}
            onChange={(e) => setNewRoomCode(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>

        {/* Join Room Card */}
        <div className="card">
          <h2>Join an Existing Room</h2>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>

        {/* Recent Rooms Card */}
        {user?.rooms?.length > 0 && (
          <div className="card">
            <h2>Recent Rooms</h2>
            <ul>
              {user.rooms.map((room, index) => (
                <li key={index}>
                  {room}{" "}
                  <button
                    onClick={() => joinRoomService(room, dispatch, navigate)}
                  >
                    Rejoin
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;
