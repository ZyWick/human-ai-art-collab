import React, { useState } from "react";
import Moodboard from "../components/Moodboard";
import Sidebar from "../components/Sidebar";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";

const Layout = ({ username, roomData, socket}) => {
  const boards = roomData.boards;
  const [board, setBoard] = useState(boards[boards.length - 1]);
  const [images, setImages] = useState(board.images);
  const [users, setUsers] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  useBoardSocket(socket, username, roomData._id, setUsers, setImages);

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
      <Moodboard images={images} setImages={setImages} selectedImageId={selectedImageId} setSelectedImageId={setSelectedImageId} socket={socket} />
    </div>
  );
};

export default Layout;
