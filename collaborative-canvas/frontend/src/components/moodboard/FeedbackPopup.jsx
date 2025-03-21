import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  selectPopulatedThreadById,
  updateThread,
} from "../../redux/threadsSlice";

const FeedbackPopup = ({ popupData, onClose }) => {
  const [reply, setReply] = useState("");
  const [position, setPosition] = useState(popupData.position);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const popupRef = useRef(null);
  const repliesContainerRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();
  const dispatch = useDispatch();
  const threadData = useSelector(selectPopulatedThreadById(popupData.threadId));

  const handleEditClick = (child) => {
    setEditingId(child._id);
    setEditText(child.value); // Pre-fill input with current value
  };

  const handleSave = () => {
    const update = {
      id: editingId,
      changes: { value: editText },
    };

    dispatch(updateThread(update));
    socket.emit("editThreadValue", update);
    setEditingId(null); // Exit edit mode
  };

  const onResolve = () => {
    const update = {
      id: threadData._id,
      changes: { isResolved: true },
    };

    dispatch(updateThread(update));
    socket.emit("markThreadResolved", update);
  };

  useEffect(() => {
    if (repliesContainerRef.current) {
      repliesContainerRef.current.scrollTop =
        repliesContainerRef.current.scrollHeight;
    }
  }, [threadData.children]);

  useEffect(() => {
    if (popupRef.current) {
      const { width, height } = popupRef.current.getBoundingClientRect();
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - width - 10),
        y: Math.min(prev.y, window.innerHeight - height - 10),
      }));
    }
  }, [popupData.position]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [dragging, offset]
  );

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove]);

  const handleReply = () => {
    if (!reply.trim()) return;
    socket.emit("createThread", {
      userId: user.id,
      username: user.username,
      boardId: threadData.boardId,
      imageId: threadData.imageId,
      keywordId: threadData.keywordId,
      parentId: threadData._id,
      value: reply,
    });
    setReply("");
  };

  const timeAgo = useCallback((date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds == 0) return `Just now`;
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${Math.floor(hours / 24)} day${hours > 1 ? "s" : ""} ago`;
  }, []);

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
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
        onMouseDown={handleMouseDown}
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
        {threadData.userId === user.id && editingId !== threadData._id && (
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#777",
            }}
            onClick={() => handleEditClick(threadData)}
          >
            &#8230;
          </button>
        )}
      </div>

      {editingId === threadData._id ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "4px",
            width: "90%",
          }}
        >
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              fontSize: "13px",
              padding: "6px",
              width: "100%",
              minHeight: "60px",
              resize: "vertical",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <button
              onClick={handleSave}
              style={{
                fontSize: "13px",
                padding: "6px 10px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
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
      )}

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
              {child.userId === user.id && editingId !== child._id && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#777",
                  }}
                  onClick={() => handleEditClick(child)}
                >
                  &#8230;
                </button>
              )}
            </div>

            {editingId === child._id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "4px",
                  width: "90%",
                }}
              >
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{
                    fontSize: "13px",
                    padding: "6px",
                    width: "100%",
                    minHeight: "60px",
                    resize: "vertical",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "4px",
                  }}
                >
                  <button
                    onClick={handleSave}
                    style={{
                      fontSize: "10px",
                      padding: "6px 10px",
                      background: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
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
            )}
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
          onKeyDown={(e) => e.key === "Enter" && handleReply()}
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
          onClick={() => handleReply()}
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
