import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Moodboard from "../moodboard/Moodboard";
import "../../assets/styles/Layout.css";
import Toolbar from './Toolbar'
import MergeKeywords from './MergeKeywords'
import DesignWorkspace from './DesignWorkspace'
import ImageZoom from "../widgets/ImageZoom";

import useBoardSocket from "../../hook/useBoardSocket";
import { setImages } from "../../redux/imagesSlice";
import { setSelectedKeywords } from "../../redux/selectionSlice";
import { setBoards } from "../../redux/boardsSlice";
import { getRoom, getBoard } from "../../util/api";
import { setKeywords } from "../../redux/keywordsSlice";
import { setThreads } from "../../redux/threadsSlice";
import RoomDetails from "./RoomDetails";
import RoomStatusBar from "./RoomStatusBar";

const Layout = () => {
  useBoardSocket();
  const dispatch = useDispatch();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const stageRef = useRef(null);

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
      <div className="layout-container">
          <RoomDetails />
          <RoomStatusBar />
          <DesignWorkspace stageRef={stageRef}/>
          <MergeKeywords  />
          <Toolbar stageRef={stageRef}/>
          <ImageZoom/>
        <div className="moodboard-container">
          <Moodboard stageRef={stageRef}/>
        </div>
      </div>
  );
};

export default Layout;
