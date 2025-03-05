import React, { useState } from "react";
import Moodboard from "../components/Moodboard";
import Sidebar from "../components/Sidebar";
import useBoardSocket from "../hook/useBoardSocket";
import { io } from "socket.io-client";
import "./Layout.css";

const socket = io("http://localhost:5000");

const Layout = ({ username, roomData }) => {
  const boards = roomData.boards;
  const [board, setBoard] = useState(boards[boards.length - 1]);
  const [images, setImages] = useState(board.images);
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useBoardSocket(socket, username, roomData._id, setUsers, setImages);

  const handleDelete = (id) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
  };

  return (
    <div className="layout-container">
        <div className="sidebar-overlay">
          <Sidebar
            socket={socket}
            boardId={board._id}
            users={users}
            roomName={roomData.name}
            username={username}
          />
        </div>
      <Moodboard images={images} setImages={setImages} socket={socket} />
    </div>
  );
};

export default Layout;
