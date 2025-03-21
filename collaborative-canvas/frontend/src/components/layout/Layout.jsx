import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./Dashboard";
import OutputHub from "./OutputHub";
import Header from "./Header";
import Moodboard from "../moodboard/Moodboard";
import "../../assets/styles/Layout.css";
import Toolbar from './Toolbar'

import useBoardSocket from "../../hook/useBoardSocket";
import { setRoomChat, setBoardThreads } from "../../redux/roomSlice";
import { setImages } from "../../redux/imagesSlice";
import { setSelectedKeywords, setSelectedImage } from "../../redux/selectionSlice";
import { setBoards } from "../../redux/boardsSlice";
import { getRoom, getBoard } from "../../util/api";
import { addKeywordsFromImages, addKeywords } from "../../redux/keywordsSlice";
import { resetKeywords } from "../../redux/keywordsSlice";
import { addThreads } from "../../redux/threadsSlice";

const Layout = () => {
  useBoardSocket();
  const dispatch = useDispatch();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);

  useEffect(() => {
    const fetchBoard = async () => {
      if (!currentBoardId) return;
  
      try {
        // Fetch board and room data in parallel
        const {board: newBoard, threads: newThreads} = await getBoard(currentBoardId);
        const roomPromise = newBoard.roomId ? getRoom(newBoard.roomId) : null;
        const newRoomData = await roomPromise;
  
        console.log(newThreads)
        // Process images
        const processedImages = newBoard.images.map(image => ({
          ...image,
          keywords: image.keywords.map(keyword => keyword._id.toString()) // Store only IDs
        }));
  
        // Collect selected keyword IDs
        const selectedKeywordIds = [
          ...newBoard.images.flatMap(image =>
            image.keywords?.filter(k => k.isSelected && k.offsetX !== undefined && k.offsetY !== undefined)
              .map(k => k._id) || []
          ),
          ...newBoard.keywords?.filter(k => k.isSelected).map(k => k._id) || []
        ];
  
        // Batch dispatch calls
        dispatch(setSelectedImage(null));
        dispatch(setSelectedKeywords(selectedKeywordIds));
        dispatch(setImages(processedImages));
        dispatch(resetKeywords());
        dispatch(addKeywords(newBoard.keywords));
        dispatch(addKeywordsFromImages(newBoard.images));
        dispatch(addThreads(newThreads));
  
        if (newRoomData) {
          dispatch(setBoards(newRoomData.boards));
        }
  
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
        {/* <div className="sidebar-overlay left">
          <Dashboard />          
        </div>  
          <Toolbar />
        <div className="moodboard-container">
          <Moodboard />
        </div>
        {/* <div className="sidebar-overlay right">
          <OutputHub />
        </div> */}
      </div>
    </>
  );
};

export default Layout;
