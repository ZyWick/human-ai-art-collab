import React, { useEffect, useState } from "react";
import Moodboard from "../components/Moodboard";
import Sidebar from "../components/Sidebar";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";
import { setImages } from "../redux/imageSlice";
import { useDispatch, useSelector } from "react-redux";

const Layout = () => {
  const dispatch = useDispatch(); 
  const roomData = useSelector((state) => state.socket.roomData);
  const boards = roomData.boards;
  const selectedBoard = boards[boards.length - 1]
  const images = selectedBoard.images;

  useBoardSocket()
  dispatch(setImages(images))

  return (
    <div className="layout-container">
        <div className="sidebar-overlay">
          <Sidebar/>
        </div>
      <Moodboard />
    </div>
  );
};

export default Layout;
