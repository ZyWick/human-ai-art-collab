import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useNavigate
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { selectBoardById } from "../../redux/boardsSlice";
import { useSocket } from "../../context/SocketContext";
import { setRoomName } from "../../redux/roomSlice";
import { updateBoard } from "../../redux/boardsSlice";
import "../../assets/styles/UserAvatars.css";
import BoardsDropdown from "../widgets/BoardsDropdown";

const RoomDetails = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const { joinCode } = useParams();
  const { roomName, roomId, currentBoardId } = useSelector(
    (state) => state.room
  );
  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );

  const [browsePages, setBrowsePages] = useState(false);
  const [editing, setEditing] = useState({ room: false, board: false });
  const [tempName, setTempName] = useState({
    room: roomName,
    board: currBoard?.name,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTempName({ room: roomName, board: currBoard?.name });
  }, [roomName, currBoard]);

  const handleEdit = (field) =>
    setEditing((prev) => ({ ...prev, [field]: true }));

  const handleBlur = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));
    let newName =
      tempName[field].trim() ||
      (field === "room" ? "Untitled Room" : "Untitled Board");

    setTempName((prev) => ({ ...prev, [field]: newName }));
    if (newName !== (field === "room" ? roomName : currBoard?.name)) {
      if (field === "room") {
        dispatch(setRoomName, newName);
        socket.emit("updateRoomName", { roomId, roomName: newName });
      } else {
        const update = { id: currentBoardId, changes: { name: newName } };
        dispatch(updateBoard, update);
        socket.emit("updateBoard", update);
      }
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

  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setBrowsePages(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div
        style={{
          position: "absolute",
          maxWidth: "35vw",
          minWidth: "240px",
          height: "2.812em",
          left: "2.5%",
          top: "2%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
          alignItems: "center",
          display: "flex",
          zIndex: "100",
          paddingLeft: "0.3em",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <EditableAutoWidthInput
            value={tempName?.room}
            onChange={(val) => setTempName({ ...tempName, room: val })}
            onBlur={() => handleBlur("room")}
            onKeyDown={(e) => handleKeyDown(e, "room")}
            onClick={() => handleEdit("room")}
            editing={editing.room}
            maxLength={30}
            text={roomName}
            tag={"h4"}
          />

          <div
            style={{
              height: "1.5em",
              minWidth: "1px",
              backgroundColor: "#ccc",
            }}
          />
          <div
            style={{
              padding: "0.3em 0.6em",
              borderRadius: "4px",
              transition: "background-color 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f0f0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <h4
              onClick={handleCopy}
              className="commonButton"
              style={{
                color: "black",
                margin: "0",
                cursor: "pointer",
              }}
            >
              {joinCode}
            </h4>
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
          <div
            style={{
              height: "1.5em",
              minWidth: "1px",
              backgroundColor: "#ccc",
            }}
          />

          <EditableAutoWidthInput
            value={tempName?.board}
            onChange={(val) => setTempName({ ...tempName, board: val })}
            onBlur={() => handleBlur("board")}
            onKeyDown={(e) => handleKeyDown(e, "board")}
            onClick={() => handleEdit("board")}
            editing={editing.board}
            maxLength={30}
            text={currBoard?.name}
            tag={"h4"}
          />
        </div>
        <button
        ref={buttonRef}
           className={browsePages ? "active commonButton" : "commonButton" }
          style={{
            marginRight: "0.5em",
            width: "fit-content",
            paddingInline: "0.5em",
            height: "80%",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75em",
          }}
          onClick={() => setBrowsePages(!browsePages)}
        >
          <img
            src="/icons/verticalDots.svg"
            alt="Show iterations"
            width="20"
            height="20"
          />
        </button>
        {browsePages && 
        <div 
        className="scrollable-container"
          style={{
            display: "flex", flexDirection: "column", gap: "0.2em",
            position: "absolute",
            top: "2%",
            left: `102.5%`,
            maxHeight: "17.5vh",
            width:"100%",
            maxWidth: "260px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
            padding: "0.5em",
            zIndex: 99,
          }}
        >
          <BoardsDropdown />
        </div>}
      </div>
    </>
  );
};

function EditableAutoWidthInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  onClick,
  editing,
  maxLength = 32,
  placeholder = "Edit...",
  text,
  tag: Tag = "h4", // Use "h3", "h4", "span" etc. for display
}) {
  const maxWidth = "10vw";
  const sizerRef = useRef(null);
  const inputRef = useRef(null);
  const [inputWidth, setInputWidth] = useState("fit-content");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const resize = () => {
      if (sizerRef.current) {
        const width = sizerRef.current.offsetWidth; // Add padding
        setInputWidth(`${width}px`);
      }
    };

    // Short delay lets DOM update the span text
    const timeout = setTimeout(resize, 0);

    return () => clearTimeout(timeout);
  }, [value, editing]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        maxWidth,
      }}
    >
      <div
        ref={sizerRef}
        style={{
          position: "absolute",
          // visibility: "hidden",
          height: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth,
        }}
      >
        <span
          className="roomDetails-text-matching-style"
          style={{
            marginInline: "0.6em",
          }}
        >
          {value || placeholder}
        </span>
      </div>

      {editing ? (
        <>
          <input
            className="roomDetails-text-matching-style"
            onMouseLeave={() => setHover(false)}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
            maxLength={maxLength}
            style={{
              boxShadow: "0 0 0 0.5px blue",
              border: "none",
              outline: "none",
              padding: "0.3em 0.6em",
              width: "fit-content",
              maxWidth: `calc(${inputWidth} - 1.2em)`,
            }}
          />
        </>
      ) : (
        <>
          <Tag
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="roomDetails-text-matching-style"
            style={{
              margin: "0",
              cursor: "text",
              border: "none",
              outline: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0.3em 0.6em",
              boxShadow: hover ? "0 0 0 0.5px darkgrey" : "none",
              width: "fit-content",
              maxWidth,
            }}
            onClick={onClick}
          >
            {text}
          </Tag>
        </>
      )}
    </div>
  );
}

export default RoomDetails;
