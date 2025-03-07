import React from "react";
import UploadButton from "../widgets/UploadButton";
import KeywordSelection from "../widgets/keywordSelection";
// import "../styles/Sidebar.css"

const Sidebar = ({ socket, selectedImage, boardId, users }) => {
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
      {selectedImage && <KeywordSelection selectedImage={selectedImage} />}
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
