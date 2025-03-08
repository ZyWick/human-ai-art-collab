import React from "react";
import UploadButton from "../widgets/UploadButton";
import KeywordSelection from "../widgets/keywordSelection";
// import "../styles/Sidebar.css"
import { useSelector } from "react-redux";

const Sidebar = () => {
  const users = useSelector((state) => state.room.users);
  const selectedImageId = useSelector((state) => state.selection.selectedImageId);
  
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
      <UploadButton />
      {selectedImageId && <KeywordSelection selectedImageId={selectedImageId} />}
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
