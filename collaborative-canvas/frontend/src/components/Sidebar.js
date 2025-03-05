import React, { useState} from "react";
import UploadButton from "./UploadButton";

const Sidebar = ({ socket, boardId, users, roomName, username}) => {
    const [imageUrl, setImageUrl] = useState("");
    const [image, setImage] = useState({});
  
    const addImage = () => {
      if (!imageUrl.trim()) return alert("Please enter a valid image URL!");
  
      const newImage = {
        boardId: boardId,
        url: imageUrl,
        x: Math.random() * window.innerWidth * 0.7,
        y: Math.random() * window.innerHeight * 0.7,
      };

      socket.emit("newImage", newImage);
      setImageUrl(""); // Clear input field
    };
  
    return (
      <div style={{ width: "100%", height: "100%", backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <UploadButton socket={socket} boardId={boardId}/>
        <div>
          <h3>Users in Room:</h3>
          <ul>
            {users.map((user) => (<li key={user.id}>{user.username}</li>))}
          </ul>
        </div>
      </div>
    );
  };

  export default Sidebar;