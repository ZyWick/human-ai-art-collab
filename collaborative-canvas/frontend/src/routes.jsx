import React from "react";
import { Route, Routes } from "react-router-dom";
// import FrontPage from "./pages/FrontPage";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Profile from "./components/auth/Profile";
import PrivateRoute from "./context/AuthRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/room/:joinCode" element={<PrivateRoute><RoomPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
