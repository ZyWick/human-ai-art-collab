import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useNavigate
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { selectBoardById } from "../../redux/boardsSlice";
import { useSocket } from "../../context/SocketContext";
import { setRoomName } from "../../redux/roomSlice";
import { updateBoard } from "../../redux/boardsSlice";
import "../../assets/styles/UserAvatars.css";

const RoomDetails = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const { joinCode } = useParams();
  const {
    roomName,
    roomId,
    currentBoardId,
  } = useSelector((state) => state.room);
  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );

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

  return (
    <div
      style={{
        position: "absolute",
        maxWidth: "33vh",
        width: "240px",
        minWidth: "fit-content",
        height: "2.812em",
        left: "2.5%",
        top: "2%",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
        paddingInline: "13px",
        alignItems: "center",
        display: "flex",
        zIndex: "100",
      }}
    >
      {/* <button
    onClick={handleBack}
    style={{
      padding: "0.85em 0.75em 0.5em 0.25em",
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
  </button> */}
  

      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          gap: "0.75em",
        }}
      >
        <HoverableWrapper isEditing={editing.room}>
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
        </HoverableWrapper>

        <div
          style={{
            height: "1.5em",
            width: "1px",
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
            style={{
              margin: "0",
              cursor: "pointer",
              whiteSpace: "nowrap",
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
            width: "1px",
            backgroundColor: "#ccc",
          }}
        />

        <HoverableWrapper isEditing={editing.board}>
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
        </HoverableWrapper>
      </div>
    </div>
  );
};

function EditableAutoWidthInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  onClick,
  editing,
  maxLength = 30,
  placeholder = "Edit...",
  fontSize = "0.95em",
  fontWeight = "bold",
  text,
  tag: Tag = "h4", // Use "h3", "h4", "span" etc. for display
}) {
  const sizerRef = useRef(null);
  const inputRef = useRef(null);
  const [inputWidth, setInputWidth] = useState("60px");

  // Update width as value changes
  useEffect(() => {
    const resize = () => {
      if (sizerRef.current) {
        const width = sizerRef.current.offsetWidth + 10; // Add padding
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
        width: "fit-content",
        alignItems: "center",
        maxWidth: "100%",
      }}
    >
      {editing ? (
        <>
          <span
            ref={sizerRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "pre",
              fontSize,
              fontWeight,
              padding: "0.35em",
            }}
          >
            {value || placeholder}
          </span>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
            maxLength={maxLength}
            style={{
              marginTop: "0.2em",
              marginLeft: "-0.1em",
              paddingBlock: "0.35em",
              fontSize,
              fontWeight,
              boxShadow: "0 0 0 0.5px blue",
              borderRadius: "6px",
              border: "none",
              outline: "none",
              width: inputWidth,
              minWidth: "50px",
              maxWidth: "100%",
            }}
          />
        </>
      ) : (
        <Tag
          style={{
            cursor: "pointer",
            margin: "0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
          onClick={onClick}
        >
          {text}
        </Tag>
      )}
    </div>
  );
}

const HoverableWrapper = ({ isEditing, children }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "0.3em 0.6em",
        borderRadius: "4px",
        transition: "background-color 0.2s",
        cursor: "pointer",
        backgroundColor: isEditing
          ? "white"
          : hover
          ? "#f0f0f0"
          : "transparent",
      }}
    >
      {children}
    </div>
  );
};

export default RoomDetails;
