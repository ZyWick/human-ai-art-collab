import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../css/Login-Register.module.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate("/home"); // Redirect to Home Page after registration
      alert("Registration successful");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-box"]}>
      <h1 className={styles["login-title"]}>Signup</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles["login-input"]}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles["login-input"]}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles["login-input"]}
        />
        <button type="submit" className={styles["login-button"]}>
            Signup
        </button>
      </form>
      <p className={styles["login-text"]}>
        Already have an account? <a href="/login" className={styles["login-link"]}>Login</a>
      </p>
      </div>
    </div>
  );
};

export default Register;