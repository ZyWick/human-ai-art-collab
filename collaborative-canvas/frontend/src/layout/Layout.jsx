import React, { useEffect, useState } from "react";
import Moodboard from "../components/Moodboard";
import Sidebar from "../components/Sidebar";
import useBoardSocket from "../hook/useBoardSocket";
import { useSocket } from "../SocketContext";
import "./Layout.css";

const Layout = ({ username, roomData}) => {
  const boards = roomData.boards;
  const [board, setBoard] = useState(boards[boards.length - 1]);
  const [images, setImages] = useState(boards[boards.length - 1].images);
  const [users, setUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const socket = useSocket();
  useBoardSocket(socket, username, roomData._id, setUsers, setImages);

  useEffect(() => {
    setBoard (boards[boards.length - 1])
  }, [boards]);

  return (
    <div className="layout-container">
        <div className="sidebar-overlay">
          <Sidebar
            socket={socket}
            boardId={board._id}
            users={users}
            roomName={roomData.name}
            username={username}
            selectedImage={selectedImage}
          />
        </div>
      <Moodboard images={images} setImages={setImages} selectedImage={selectedImage} setSelectedImage={setSelectedImage} socket={socket} />
    </div>
  );
};

export default Layout;
