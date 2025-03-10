import React, { useEffect, useRef, useState } from "react";
import Moodboard from "../components/Moodboard";
import Dashboard from "../components/Dashboard";
import useBoardSocket from "../hook/useBoardSocket";
import "./Layout.css";
import OutputHub from "../components/OutputHub";
import { useDispatch, useSelector } from "react-redux";
import { setGeneratedImages, setBoardNoteKeywords } from "../redux/roomSlice";
import { setImages } from "../redux/imagesSlice";
import { setSelectedKeywords, setSelectedImage } from "../redux/selectionSlice";
import { setBoards, selectBoardById } from "../redux/boardsSlice";
import { getRoom, getBoard } from "../util/api";
import UserAvatars from "../widgets/UserAvatars";

const Layout = () => {
  useBoardSocket();
  const dispatch = useDispatch();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const roomName = useSelector ((state) => state.room.roomName)
  const currBoard = useSelector ((state) => selectBoardById(state, currentBoardId))
  const boardName = currBoard?.name
  const headerRef = useRef();
  const [editing, setEditing] = useState({ room: false, board: false });
  const [tempName, setTempName] = useState({ room: roomName, board: boardName });

  const handleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));
    // if (field === "room") setRoomName(tempName.room);
    // else setBoardName(tempName.board);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleBlur(field);
  };

  useEffect(() => {
    const fetchBoard = async () => {
      if (currentBoardId) {
        // Ensure there's a valid board ID
        try {
          const newBoard = await getBoard(currentBoardId);
          const newRoomData = await getRoom(newBoard.roomId);
          if (newRoomData) dispatch(setBoards(newRoomData.boards));
          dispatch(setGeneratedImages(newBoard.generatedImages));
          dispatch(setBoardNoteKeywords(newBoard.keywords));
          dispatch(setImages(newBoard.images));
          const selectedKeywordIds = [
            ...newBoard.images.flatMap((image) =>
              image.keywords
                ?.filter(
                  (keyword) =>
                    keyword.isSelected &&
                    keyword.offsetX !== undefined &&
                    keyword.offsetY !== undefined
                )
                .map((k) => k._id)
            ),
            ...newBoard.keywords
              ?.filter((keyword) => keyword.isSelected)
              .map((k) => k._id),
          ];
          dispatch(setSelectedImage(null));
          dispatch(setSelectedKeywords(selectedKeywordIds));
        } catch (error) {
          console.error("Failed to fetch board:", error);
        }
      }
    };

    fetchBoard(); // Call the async function
  }, [currentBoardId, dispatch]);

  return (<>
<div 
  ref={headerRef}
  style={{
    maxWidth: "100%",
    height: "2em",
    display: "flex",
    paddingInline: "1em",
    alignItems: "center",
    // justifyContent: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    backgroundColor: "#d5e1e1",
    borderBottom: "0.5px ridge rgb(216, 216, 216)"
  }}
>
<div style={{ width: "30%",  }}>
        {editing.room ? (
          <input
            value={tempName.room}
            onChange={(e) => setTempName({ ...tempName, room: e.target.value })}
            onBlur={() => handleBlur("room")}
            onKeyDown={(e) => handleKeyDown(e, "room")}
            autoFocus
            style={{
              fontSize: "1.17em",
              fontWeight: "bold",
              backgroundColor: "#F5F5F5",
              border: "none",
              outline: "none",
              height: "100%",
              width: "65%",
              minWidth: "65%"
            }}
          />
        ) : (
          <h3 style={{ cursor: "pointer", margin: "0" }} onClick={() => handleEdit("room")}>
            {roomName}
          </h3>
        )}
      </div>

      <div style={{ flexGrow: 1, textAlign: "center" }}>
        {editing.board ? (
          <input
            value={tempName.board}
            onChange={(e) => setTempName({ ...tempName, board: e.target.value })}
            onBlur={() => handleBlur("board")}
            onKeyDown={(e) => handleKeyDown(e, "board")}
            autoFocus
            style={{
              fontSize: "1.17em",
              fontWeight: "bold",
              backgroundColor: "#F5F5F5",
              border: "none",
              outline: "none",
              // paddingTop: "0.2em",
              height: "100%",
              textAlign: "center",
              width: "65%",
              minWidth: "65%"
            }}
          />
        ) : (
          <h3 style={{ cursor: "pointer", margin: "0" }} onClick={() => handleEdit("board")}>
            {boardName}
          </h3>
        )}
      </div>
  <UserAvatars headerRef={headerRef} />
</div>

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
    </div></>
  );
};

export default Layout;
