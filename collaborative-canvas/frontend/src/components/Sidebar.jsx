import React, { useState } from "react";
import UploadButton from "./UploadButton";

const Sidebar = ({ socket, boardId, users, roomName, username }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <UploadButton socket={socket} boardId={boardId} />
      <div>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
