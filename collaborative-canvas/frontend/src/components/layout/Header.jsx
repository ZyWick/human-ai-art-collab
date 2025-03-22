import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate

import { selectBoardById } from "../../redux/boardsSlice";
import { useSocket } from "../../context/SocketContext";
import { setRoomName } from "../../redux/roomSlice";
import { updateBoard } from "../../redux/boardsSlice";
import "../../assets/styles/UserAvatars.css";

const Header = () => {
  const headerRef = useRef();
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { joinCode } = useParams();
  const { roomName, roomId, currentBoardId } = useSelector(
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
      socket.emit("updateBoardName", {
        boardId: currentBoardId,
        boardName: newName,
      });
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleBlur(field);
  };

  const handleCopy = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Hide after 1.5s
  };

  const handleBack = () => {
    navigate("/home"); // Navigate back to the home page
  };

  const usernames = useSelector((state) => state.room.users);
  const containerRef = useRef(null);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [hiddenUsers, setHiddenUsers] = useState([]);

  useEffect(() => {
    const resizeHandler = () => {
      if (!headerRef.current || !containerRef.current) return;

      const { width: headerWidth, height: headerHeight } =
        headerRef.current.getBoundingClientRect();
      const totalAvatarWidth =
        headerHeight * 0.8 +
        containerRef.current.getBoundingClientRect().width * 0.03;
      const fitCount = Math.floor(
        (headerWidth * 0.3 -
          (usernames.length * totalAvatarWidth > headerWidth * 0.3
            ? totalAvatarWidth
            : 0)) /
          totalAvatarWidth
      );

      setVisibleUsers(usernames.slice(0, fitCount));
      setHiddenUsers(usernames.slice(fitCount));
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [usernames, headerRef, containerRef]);

  return (
    <div
      ref={headerRef}
      style={{
        maxWidth: "100%",
        height: "1.85em",
        display: "flex",
        paddingInline: "2em",
        alignItems: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        backgroundColor: "#d5e1e1",
        // borderBottom: "0.5px ridge rgb(216, 216, 216)",
      }}
    >
      {/* Back Button */}
      <button
        className="header-back-button"
        onClick={handleBack}
        style={{
          marginRight: "1em",
          padding: "0.5em",
          paddingTop: "0.85em",
          paddingLeft: "0",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <img
          src="/icons/home-svgrepo-com.svg"
          alt="Home"
          style={{ width: "24px", height: "24px" }}
        />
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
            Room code: {joinCode}
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
      <div className="avatars-container" ref={containerRef}>
        {visibleUsers.length > 0 &&
          visibleUsers.map((user, index) => (
            <div key={index} className="avatar" title={user}>
              {user[0]}
            </div>
          ))}
        {hiddenUsers.length > 0 && (
          <div className="avatar more" title={hiddenUsers.join(", ")}>
            +{hiddenUsers.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
