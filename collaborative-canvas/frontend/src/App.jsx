import React, { useEffect, useState } from "react";
import Layout from "./layout/Layout";
import {joinRoom} from "./components/api"

const BACKEND_URL =
process.env.NODE_ENV === 'production'
  ? process.env.API_URL // production URL set on the server/environment
  : process.env.API_URL || 'http://localhost:5000'; // fallback for dev

function App() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("UJONZK");
  const [roomData, setRoomData] = useState(null);
  const [joined, setJoined] = useState(false);

  const joinTheRoom = async () => {
    try {
      if (!username || !roomCode) return;
      let newRoomData = await joinRoom(roomCode);
      setRoomData(newRoomData);
      console.log('Joined Room:', newRoomData);
      setJoined(true);
    } catch (error) {
      console.error('Error joining room:', error);
    }
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
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter moodboard room name"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinTheRoom}>Join</button>
        </div>
      ) : (
        <Layout username={username} roomData={roomData} backendUrl={BACKEND_URL} />
      )}
    </div>
  );
}

export default App;
