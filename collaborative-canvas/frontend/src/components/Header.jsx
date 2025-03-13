import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import UserAvatars from "../widgets/UserAvatars";
import { selectBoardById } from "../redux/boardsSlice";
import { useSocket } from "./SocketContext";
import { setRoomName } from "../redux/roomSlice";
import { updateBoard } from "../redux/boardsSlice";

const Header = () => {
  const headerRef = useRef();
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { roomName, roomCode, roomId, currentBoardId } = useSelector(
    (state) => state.room
  );
  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );
  const boardName = currBoard?.name;
  const [editing, setEditing] = useState({ room: false, board: false });
  const [tempName, setTempName] = useState({
    room: roomName,
    board: boardName,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTempName({ board: boardName, room: roomName });
  }, [currentBoardId, boardName, roomName]);

  const handleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));

    let newName = tempName[field].trim();
    if (!newName) {
      newName = field === "room" ? "Untitled Room" : "Untitled Board";
    }

    setTempName((prev) => ({ ...prev, [field]: newName }));

    if (field === "room" && newName !== roomName) {
      dispatch(setRoomName(newName));
      socket.emit("updateRoomName", { roomId, roomName: newName });
    } else if (field === "board" && newName !== boardName) {
      dispatch(updateBoard({ id: currentBoardId, changes: { name: newName } }));
      socket.emit("updateBoardName", { boardId: currentBoardId, boardName: newName });
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleBlur(field);
  };

  const handleCopy = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Hide after 1.5s
  };

  const handleBack = () => {
    navigate("/"); // Navigate back to the home page
  };

  return (
    <div
      ref={headerRef}
      style={{
        maxWidth: "100%",
        height: "2em",
        display: "flex",
        paddingInline: "2em",
        alignItems: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        backgroundColor: "#d5e1e1",
        borderBottom: "0.5px ridge rgb(216, 216, 216)",
      }}
    >
      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
          marginRight: "1em",
          padding: "0.5em 1em",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "0.9em",
        }}
      >
        Back
      </button>

      <div
        style={{
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ width: "33%" }}>
          {editing.room ? (
            <input
              value={tempName.room}
              onChange={(e) =>
                setTempName({ ...tempName, room: e.target.value })
              }
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
                minWidth: "65%",
              }}
            />
          ) : (
            <h3
              style={{ cursor: "pointer", margin: "0" }}
              onClick={() => handleEdit("room")}
            >
              {roomName}
            </h3>
          )}
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <h3 style={{ cursor: "pointer", margin: "0" }} onClick={handleCopy}>
            Room code: {roomCode}
          </h3>
          {copied && (
            <div
              style={{
                position: "absolute",
                left: "100%", // Positions it to the right of h3
                top: "50%",
                transform: "translateY(-50%)", // Aligns vertically
                background: "black",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                marginLeft: "8px", // Adds spacing
              }}
            >
              Copied!
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", width: "33%" }}>
          {editing.board ? (
            <input
              value={tempName.board}
              onChange={(e) =>
                setTempName({ ...tempName, board: e.target.value })
              }
              onBlur={() => handleBlur("board")}
              onKeyDown={(e) => handleKeyDown(e, "board")}
              autoFocus
              style={{
                fontSize: "1.17em",
                fontWeight: "bold",
                backgroundColor: "#F5F5F5",
                border: "none",
                outline: "none",
                height: "100%",
                textAlign: "center",
                width: "65%",
                minWidth: "65%",
              }}
            />
          ) : (
            <h3
              style={{ cursor: "pointer", margin: "0" }}
              onClick={() => handleEdit("board")}
            >
              {boardName}
            </h3>
          )}
        </div>
      </div>
      <UserAvatars headerRef={headerRef} />
    </div>
  );
};

export default Header;