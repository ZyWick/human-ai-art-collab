import React, {useState} from "react";
import UploadButton from "../widgets/UploadButton";
import KeywordSelection from "../widgets/keywordSelection";
// import "../styles/Sidebar.css"
import { useSelector } from "react-redux";
import {NoteKeywordInput} from '../widgets/KeywordButton'
import { useSocket } from './SocketContext'

const Sidebar = () => {
  const users = useSelector((state) => state.room.users);
  const selectedImageId = useSelector((state) => state.selection.selectedImageId);
  const boardId  = useSelector((state) => state.room.currentBoardId);
  const socket = useSocket();

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: boardId,  type, keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
     }
    socket.emit("newNoteKeyword", newKeyword)
  }
  
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
      {/* <div>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div> */}
      <div style={{width: "100%", marginTop: "auto"}}>
      <hr
        style={{
          border: "none",
          height: "0.05em",
          backgroundColor: "darkgrey",
          width: "100%",
        }}
      /><div style={{width: "90%", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",}}>
        <div style={{width: "90%",}}>
        <h3 style={{marginBlock: "0px", fontSize: "1.25em"}}>Add notes</h3><p style={{ color: "grey", margin: "0", marginBottom: "0.65em" }}>
          Add Keywords that you like
        </p>
        <NoteKeywordInput addKeywordSelection={addKeywordSelection} />
        </div></div>
    </div>
    </div>
  );
};

export default Sidebar;
