import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
// import { FaEnvelope, FaLock, FaFacebook } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
import JoinRoom from "./JoinRoom"; // Import the new JoinRoom component
import "./JoinRoom.css"; // Import the JoinRoom CSS
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(BACKEND_URL);

function App() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState({ username: "", room: "" });

  // Handle user login
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const response = await axios.post(`${BACKEND_URL}/api/login`, { email, password });
  //     localStorage.setItem("token", response.data.token);
  //     setToken(response.data.token);
  //     setError("");
  //   } catch (err) {
  //     setError(err.response?.data?.error || "Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle user registration
  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const response = await axios.post(`${BACKEND_URL}/api/register`, { email, password });
  //     setError("Registration successful. Please login.");
  //   } catch (err) {
  //     setError(err.response?.data?.error || "Registration failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle joining a room
  const handleJoin = async ({ username, room }) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/join-room`, { username, room });
      setUserData({ username, room });
      setJoined(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    if (!joined) return;

    socket.on("loadImages", (loadedImages) => {
      setImages(loadedImages);
    });

    socket.on("newImage", (imageData) => {
      setImages((prev) => [...prev, imageData]);
    });

    socket.on("updateImage", (updatedImage) => {
      setImages((prev) =>
        prev.map((img) => (img.id === updatedImage.id ? updatedImage : img))
      );
    });

    return () => {
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("updateImage");
    };
  }, [joined]);

  return (
    <div className="app-container">
      {/* {!token ? (
        <div>
          <h1>Login or Register</h1>
          <form onSubmit={handleLogin} className="inline-form">
            <div className="input-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <FaLock className="icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <form onSubmit={handleRegister} className="inline-form">
            <div className="input-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <FaLock className="icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="third-party-buttons">
            <a href={`${BACKEND_URL}/api/auth/google`}>
              <FcGoogle className="icon" /> Login with Google
            </a>
            <a href={`${BACKEND_URL}/api/auth/facebook`}>
              <FaFacebook className="icon" /> Login with Facebook
            </a>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : !joined ? ( */}
      {!joined ? (
        <JoinRoom onJoin={handleJoin} loading={loading} error={error} />
      ) : (
        <div className="room-container">
          <h2>Welcome, {userData.username}!</h2>
          <p>You have joined the room: {userData.room}</p>
          <div className="moodboard">
            {images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt="Moodboard"
                style={{ position: "absolute", left: img.x, top: img.y }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;