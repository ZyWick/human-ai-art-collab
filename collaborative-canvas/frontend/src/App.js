import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaEnvelope, FaLock, FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import JoinRoom from "./JoinRoom";
import "./JoinRoom.css";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(BACKEND_URL, { autoConnect: false });

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState({ username: "", room: "" });
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const validateInputs = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/register`, { email, password });
      setError("Registration successful. Please login.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async ({ username, room }) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/join-room`, { username, room }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData({ username, room });
      setJoined(true);
      socket.connect();
      socket.emit("joinRoom", { username, room });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join room.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setJoined(false);
    setUserData({ username: "", room: "" });
    setImages([]);
    socket.disconnect();
  };

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
      socket.disconnect();
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("updateImage");
    };
  }, [joined]);

  return (
    <div className="app-container">
      {!token ? (
        <div>
          <h1>{isLogin ? "Login" : "Register"}</h1>
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="inline-form">
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
              {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
            </button>
          </form>
          <button onClick={toggleForm} className="toggle-button">
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
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
      ) : !joined ? (
        <JoinRoom onJoin={handleJoin} loading={loading} error={error} />
      ) : (
        <div className="room-container">
          <h2>Welcome, {userData.username}!</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
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