import React, { useEffect } from "react";
import Moodboard from "../components/Moodboard";
import Dashboard from "../components/Dashboard";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";
import OutputHub from "../components/OutputHub";
import { useDispatch } from "react-redux";
import {
  setRoomId,
  setRoomName,
  setUpdatedAt,
  setCurrentBoardId,
  setBoardNoteKeywords
} from "../redux/roomSlice";
import { setBoards } from "../redux/boardSlice";
import { setImages } from "../redux/imagesSlice";
import { setSelectedKeywords } from "../redux/selectionSlice";

const Layout = ({ roomData }) => {
  const dispatch = useDispatch();
  useBoardSocket();

  useEffect(() => {
    if (!roomData) return;

    const { _id, name, updatedAt, boards } = roomData;
    const initialBoard = boards?.[boards.length - 1];

    if (!initialBoard) return;

    dispatch(setRoomId(_id));
    dispatch(setRoomName(name));
    dispatch(setUpdatedAt(updatedAt));
    dispatch(setBoards(boards));
    dispatch(setCurrentBoardId(initialBoard._id));
    dispatch(setBoardNoteKeywords(initialBoard.keywords));
    dispatch(setImages(initialBoard.images));

    const selectedKeywordIds = [
      ...initialBoard.images.flatMap(image =>
        image.keywords?.filter(keyword => keyword.isSelected && keyword.offsetX !== undefined && keyword.offsetY !== undefined).map(k => k._id)
      ),
      ...initialBoard.keywords?.filter(keyword => keyword.isSelected).map(k => k._id)
    ];

    dispatch(setSelectedKeywords(selectedKeywordIds));
  }, [roomData, dispatch]);

  return (
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
    </div>
  );
};

export default Layout;
