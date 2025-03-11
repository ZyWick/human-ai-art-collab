import React, { useEffect } from "react";
import Moodboard from "../components/Moodboard";
import Dashboard from "../components/Dashboard";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";
import OutputHub from "../components/OutputHub";
import { useDispatch, useSelector } from "react-redux";
import { setBoardNoteKeywords } from "../redux/roomSlice";
import { setImages } from "../redux/imagesSlice";
import { setSelectedKeywords, setSelectedImage } from "../redux/selectionSlice";
import { setBoards } from "../redux/boardsSlice";
import { getRoom, getBoard } from "../util/api";
import Header from "../components/Header"

const Layout = () => {
  useBoardSocket();
  const dispatch = useDispatch();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);  

  useEffect(() => {
    const fetchBoard = async () => {
      if (currentBoardId) {
        // Ensure there's a valid board ID
        try {
          const newBoard = await getBoard(currentBoardId);
          // dispatch(setGeneratedImages(newBoard.generatedImages));
          const newRoomData = await getRoom(newBoard.roomId);
          if (newRoomData) dispatch(setBoards(newRoomData.boards));
          dispatch(setBoardNoteKeywords(newBoard.keywords));
          dispatch(setImages(newBoard.images));
          const selectedKeywordIds = [
            ...newBoard.images.flatMap((image) =>
              image.keywords
                ?.filter(
                  (keyword) =>
                    keyword.isSelected &&
                    keyword.offsetX !== undefined &&
                    keyword.offsetY !== undefined
                )
                .map((k) => k._id)
            ),
            ...newBoard.keywords
              ?.filter((keyword) => keyword.isSelected)
              .map((k) => k._id),
          ];
          dispatch(setSelectedImage(null));
          dispatch(setSelectedKeywords(selectedKeywordIds));
        } catch (error) {
          console.error("Failed to fetch board:", error);
        }
      }
    };

    fetchBoard(); // Call the async function
  }, [currentBoardId, dispatch]);

  return (<>
    <Header />
    <div className="layout-container">
      <div className="sidebar-overlay left">
        <Dashboard />
      </div>
      <div className="moodboard-container">
        <Moodboard />
      </div>
      <div className="sidebar-overlay right">
        <OutputHub />
      </div>
    </div></>
  );
};

export default Layout;
