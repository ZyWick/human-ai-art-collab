import React, { useState } from "react";
import Layout from "./layout/Layout";
import { joinRoom } from "./util/api";
import { SocketProvider } from "./SocketContext"; // Import provider

function App() {
  const [username, setUsername] = useState("Jeff");
  const [roomCode, setRoomCode] = useState("UJONZK");
  const [roomData, setRoomData] = useState(null);
  const [joined, setJoined] = useState(false);

  const joinTheRoom = async () => {
    if (!username || !roomCode) return;
    const newRoomData = await joinRoom(roomCode);
    setRoomData(newRoomData);
    console.log("Joined Room:", newRoomData);
    setJoined(true);
  };

  return (
    <SocketProvider>
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
          <Layout username={username} roomData={roomData} />
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
