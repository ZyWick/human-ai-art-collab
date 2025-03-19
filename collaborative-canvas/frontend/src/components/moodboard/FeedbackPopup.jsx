import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const FeedbackPopup = ({ popupData, onClose, onResolve }) => {
  const [reply, setReply] = useState("");
  const [adjustedPosition, setAdjustedPosition] = useState(popupData.position);
  const popupRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();
  const threadData = popupData.data;
  const repliesContainerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (repliesContainerRef.current) {
      repliesContainerRef.current.scrollTop =
        repliesContainerRef.current.scrollHeight;
    }
  }, [threadData.children]);

  useEffect(() => {
    if (popupRef.current) {
      const { width, height } = popupRef.current.getBoundingClientRect();

      // Adjust position if the popup overflows the viewport
      const maxX = window.innerWidth - width - 10;
      const maxY = window.innerHeight - height - 10;

      setAdjustedPosition({
        x: Math.min(popupData.position.x, maxX),
        y: Math.min(popupData.position.y, maxY),
      });
    }
  }, [popupData.position]);

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - adjustedPosition.x,
      y: e.clientY - adjustedPosition.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setAdjustedPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const onReply = () => {
    const newReply = {
      userId: user.id,
      username: user.username,
      boardId: popupData.boardId,
      imageId: popupData.imageId,
      keywordId: popupData.keywordId,
      parentId: threadData._id,
      value: reply,
    };
    if (newReply) {
      socket.emit("createThread", newReply);
    }
    setReply("");
  };

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: "12px",
        padding: "16px",
        paddingTop: "8px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)",
        zIndex: 100,
        width: "290px",
        maxWidth: "290px",
        wordWrap: "break-word",
        cursor: dragging ? "grabbing" : null,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          paddingBottom: "8px",
          cursor: "grab",
        }}
        onMouseDown={onMouseDown}
      >
        <strong style={{ fontSize: "16px", color: "#222" }}>Comment</strong>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onResolve(threadData._id)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              background: "none",
              color: "#222",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Mark as resolved"
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            ✓
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              background: "none",
              color: "#222",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Close"
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            ✕
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "#333", fontWeight: "bold" }}>
          {threadData.username}{" "}
          <span style={{ fontSize: "12px", color: "#777" }}>
            {timeAgo(threadData.createdAt)}
          </span>
        </span>
        {threadData.userId === user.id && (
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#777",
            }}
          >
            &#8230;
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "#555",
          wordWrap: "break-word",
          marginTop: "4px",
        }}
      >
        {threadData.value}
      </p>

      <div
        ref={repliesContainerRef}
        style={{ maxHeight: "214px", overflowY: "auto" }}
      >
        {/* Replies */}
        {threadData.children?.map((child) => (
          <div
            key={child._id}
            style={{
              marginLeft: "12px",
              paddingLeft: "10px",
              borderLeft: "2px solid rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: "13px", color: "#333", fontWeight: "bold" }}
              >
                {child.username}{" "}
                <span style={{ fontSize: "12px", color: "#777" }}>
                  {timeAgo(child.createdAt)}
                </span>
              </span>
              {child.userId === user.id && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#777",
                  }}
                >
                  &#8230;
                </button>
              )}
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#555",
                wordWrap: "break-word",
                marginTop: "4px",
              }}
            >
              {child.value}
            </p>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
          style={{
            fontSize: "14px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            padding: "8px",
            backgroundColor: "#FAFAFA",
            outline: "none",
            borderRadius: "6px",
            flex: 1,
          }}
        />
        <button
          onClick={() => onReply(threadData._id, reply)}
          style={{
            width: "1.85em",
            height: "1.85em",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#555",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default FeedbackPopup;
