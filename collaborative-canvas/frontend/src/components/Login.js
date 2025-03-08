import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";

const Login = ({ setToken, setError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", { email, password });
      setToken(response.data.token); // Update token in App.js
      localStorage.setItem("token", response.data.token); // Store token in localStorage
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      console.error("Login error:", err.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
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
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;