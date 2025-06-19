import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../assets/styles/Login-Register.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/home"); // Redirect to Home Page after login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-box"]}>
        <h1 className={styles["login-title"]}>Login</h1>
        {error && <p className={styles["error-message"]}>{error}</p>}
        <form onSubmit={handleSubmit}>
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
            Login
          </button>
        </form>
        <p className={styles["login-text"]}>
          Don't have an account?{" "}
          <a href="/register" className={styles["login-link"]}>
            Signup
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
