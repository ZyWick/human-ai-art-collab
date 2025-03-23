import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./Dashboard";
import OutputHub from "./OutputHub";
import Header from "./Header";
import Moodboard from "../moodboard/Moodboard";
import "../../assets/styles/Layout.css";
import Toolbar from './Toolbar'

import useBoardSocket from "../../hook/useBoardSocket";
import { setImages } from "../../redux/imagesSlice";
import { setSelectedKeywords, setSelectedImage } from "../../redux/selectionSlice";
import { setBoards } from "../../redux/boardsSlice";
import { getRoom, getBoard } from "../../util/api";
import { setKeywords } from "../../redux/keywordsSlice";
import { setThreads } from "../../redux/threadsSlice";

const Layout = () => {
  useBoardSocket();
  const dispatch = useDispatch();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  
  useEffect(() => {
    const fetchBoard = async () => {
      if (!currentBoardId) return;
  
      try {
        // Fetch board and room data in parallel
        const {board: newBoard, threads: newThreads,
          images: newImages, keywords: newKeywords
        } = await getBoard(currentBoardId);
        const newRoomData = newBoard.roomId ? await getRoom(newBoard.roomId) : null;
        const selectedKeywordIds = newKeywords?.filter(k => k.isSelected).map(k => k._id) || [];

        dispatch(setSelectedImage(null));
        dispatch(setSelectedKeywords(selectedKeywordIds));
        dispatch(setImages(newImages));
        dispatch(setKeywords(newKeywords));
        dispatch(setThreads(newThreads));
        if (newRoomData) dispatch(setBoards(newRoomData.boards));
  
      } catch (error) {
        console.error("Failed to fetch board:", error);
      }
    };
  
    fetchBoard();
  }, [currentBoardId, dispatch]);
  

  return (
    <>
      <Header />
      <div className="layout-container">
        <div className="sidebar-overlay left">
          <Dashboard />          
        </div>  
          <Toolbar />
        <div className="moodboard-container">
          <Moodboard />
        </div>
         <div className="sidebar-overlay right">
          <OutputHub />
        </div>
      </div>
    </>
  );
};

export default Layout;
