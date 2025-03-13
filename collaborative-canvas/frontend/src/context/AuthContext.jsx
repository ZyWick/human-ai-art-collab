import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const REACT_APP_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if the user is already logged in (e.g., from localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${REACT_APP_BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => setUser(response.data))
        .catch(() => setUser(null));
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${REACT_APP_BACKEND_URL}/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Register function
  const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${REACT_APP_BACKEND_URL}/auth/register`, { username, email, password });        
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create and export the useAuth hook
const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth }; // Export useAuth