import React, { useEffect, useState } from "react";
import Moodboard from "../components/Moodboard";
import Sidebar from "../components/Sidebar";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";
import { setImages } from "../redux/imagesSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentBoardId } from "../redux/roomSlice";
import { selectAllBoards } from "../redux/boardSlice";

const Layout = () => {
  const dispatch = useDispatch(); 
  // console.log(useSelector((state) => state.room))
  const boards = useSelector(selectAllBoards);
  const selectedBoard = boards[boards.length - 1]
  const images = selectedBoard.images;

  useBoardSocket()

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
