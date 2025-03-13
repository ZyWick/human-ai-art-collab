import React, {useRef}  from "react";
// import "../styles/Sidebar.css"
import { useSelector } from "react-redux";
import {NoteKeywordInput} from '../widgets/KeywordButton'
import DesignDetails from "../widgets/DesignDetails";
import ChatBox from "../widgets/ChatBox"
import KeywordSelection from "../widgets/KeywordSelection";
import UploadButton from "../widgets/UploadButton";
import { useSocket } from '../../context/SocketContext'
import '../../assets/styles/dashboard.css'

const Sidebar = () => {
 const selectedImageId = useSelector((state) => state.selection.selectedImageId);
const designDetails = useSelector((state) => state.room.designDetails);
  const boardId  = useSelector((state) => state.room.currentBoardId);
  const socket = useSocket();
  const chatRef = useRef(null);

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: boardId,  type, keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
     }
    socket.emit("newNoteKeyword", newKeyword)
  }

  const isDesignDetailsEmpty = Object.entries(designDetails)
      .filter(([key]) => key !== "others") 
      .some(([, value]) => !value?.trim()); 

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
  >{!isDesignDetailsEmpty ?  <UploadButton /> : <p style={{ fontSize: "0.75em", marginBottom: "0"}}>Complete design details to add images</p>}

    {selectedImageId ? (
      <KeywordSelection selectedImageId={selectedImageId} />
    ) : (
      <div style={{
        width: "90%",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        overflowY: "auto",
        borderRadius: "8px",
        boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        padding: "1em",
        marginTop: "1em"
      }}>
        <DesignDetails chatRef={chatRef}/>
        <ChatBox chatRef={chatRef}/>
        </div>
    )}
      <NoteKeywordInput addKeywordSelection={addKeywordSelection} />
  </div>

  );
};

export default Sidebar;
