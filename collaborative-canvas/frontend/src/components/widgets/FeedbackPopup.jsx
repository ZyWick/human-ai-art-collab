import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { timeAgo } from "../../util/time";
import { selectPopulatedThreadById, updateThread } from "../../redux/threadsSlice";
import "../../assets/styles/button.css";

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
  const dispatch = useDispatchWithMeta();
  const threadData = useSelector(selectPopulatedThreadById(popupData.threadId));

  const handleEditClick = (child) => {
    setEditingId(child._id);
    setEditText(child.value); // Pre-fill input with current value
  };

  const handleSave = () => {
    const update = { id: editingId, changes: { value: editText } };
    dispatch(updateThread, update);
    socket.emit("updateThread", update);
    setEditingId(null);
  };

  const onResolve = useCallback((id) => {
    const update = { id, changes: { isResolved: true } };
    dispatch(updateThread, update);
    socket.emit("updateThread", update);

    if (popupData.threadId === id) onClose()
  }, [dispatch, socket, onClose, popupData.threadId]);

  useEffect(() => {
    if (repliesContainerRef.current) {
      repliesContainerRef.current.scrollTop = repliesContainerRef.current.scrollHeight;
    }
  }, [threadData.children]);

  useEffect(() => {
    if (popupRef.current) {
      const { width, height } = popupRef.current.getBoundingClientRect();
      const newPosition = {
        x: Math.min(popupData.position.x, window.innerWidth - width - 10),
        y:  Math.max(7.5, Math.min(popupData.position.y, window.innerHeight - height - 10)),
      };
      setPosition(newPosition);
    }
  }, [popupData.position]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging || !popupRef.current) return;

      const { offsetWidth, offsetHeight } = popupRef.current;
      const maxX = window.innerWidth - offsetWidth;
      const maxY = window.innerHeight - offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(e.clientX - offset.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - offset.y, maxY)),
      });
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
  const textAreaRefs = useRef({});
  const resizeTextArea = (id) => {
  const el = textAreaRefs.current[id];
  if (el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
};
useEffect(() => {
  if (editingId) {
    resizeTextArea(editingId);
  }
}, [editText, editingId]);


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
            onClick={onClose}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              color: "#222",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Close"
            className="commonButton"
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
        <span style={{marginLeft:"0.5em", fontSize: "13px", color: "#333", fontWeight: "bold" }}>
          {threadData.username}{" "}
          <span style={{ fontSize: "12px", wordBreak: "break-word", color: "#777" }}>
            {timeAgo(threadData.updatedAt)}
          </span>
        </span>
        {threadData.userId === user.id && editingId !== threadData._id ? (
          <button
          title="edit comment"
            onClick={() => handleEditClick(threadData)}
            className="commonButton"
          >
             <img src="/icons/edit.svg" alt="Reset votes" width="10" height="10" />
          </button>
        ) : 
         <button
            onClick={() => onResolve(threadData._id)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              color: "#222",
              cursor: "pointer",
              paddingTop: "0.6em"
            }}
            title="delete comment"
            className="commonButton"
          >
            <img src="/icons/trash.svg" alt="Reset votes" width="14" height="14" />
          </button>
      }
      </div>

      {editingId === threadData._id ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "4px",
            width: "100%",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "0.5em"
          }}
        >
          <textarea
           ref={(el) => {
              if (el) textAreaRefs.current[threadData._id] = el;
            }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autofocus
            className="scrollable-container"
            style={{
              fontSize: "13px",
              padding: "6px",
              width: "95%",
              border: "none",
              outline: "none",
              minHeight: "20px",
              maxHeight: "13.5vh",
              resize: "none",
              borderRadius: "4px",
              borderBottom: "1px solid #ccc",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBlock: "0.3em",
              alignItems: "center"
            }}
          >
            <button
            className="editButton"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
            <button
            className="editButton doneButton" 
              onClick={handleSave}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <p
        className="scrollable-container"
          style={{
            maxHeight: "13.5vh",
            marginLeft:"0.5em",
            fontSize: "13px",
            color: "black",
            wordWrap: "break-word",
            marginTop: "4px",
             whiteSpace: "pre-wrap", 
          }}
        >
          {threadData.value}
        </p>
      )}

      <div
        ref={repliesContainerRef}
        style={{ maxHeight: "25vh", overflowY: "auto" }}
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
                <span style={{ fontSize: "12px", wordBreak: "break-word", color: "#777" }}>

                  {timeAgo(child.updatedAt)}
                </span>
              </span>
              {child.userId === user.id && editingId !== child._id ? (
                <button
                title="edit comment"
                  onClick={() => handleEditClick(child)}
                  className="commonButton"
                >
                  <img src="/icons/edit.svg" alt="Reset votes" width="10" height="10" />
                </button>
             ) : child.userId === user.id &&
         <button
            onClick={() => onResolve(child._id)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              color: "#222",
              cursor: "pointer",
              paddingTop: "0.6em"
            }}
            title="delete comment"
            className="commonButton"
          >
            <img src="/icons/trash.svg" alt="Reset votes" width="14" height="14" />
          </button>}
            </div>

            {editingId === child._id ? (
             <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "4px",
            width: "99%",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "0.5em"
          }}
        >
          <textarea
          ref={(el) => {
              if (el) textAreaRefs.current[child._id] = el;
            }}
             value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autofocus
            style={{
              fontSize: "13px",
              padding: "6px",
              width: "95%",
              border: "none",
              outline: "none",
              minHeight: "20px",
              resize: "none",
              borderRadius: "4px",
              borderBottom: "1px solid #ccc",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBlock: "0.3em",
              alignItems: "center"
            }}
          >
            <button
            className="editButton"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
            <button
            className="editButton doneButton"
              onClick={handleSave}
            >
              Done
            </button>
          </div>
        </div>
            ) : (
              <p
                style={{
                  fontSize: "13px",
                  color: "black",
                  wordWrap: "break-word",
                  marginTop: "4px",
                  whiteSpace: "pre-wrap", 
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
            backgroundColor: "white",
            outline: "none",
            borderRadius: "6px",
            flex: 1,
          }}
        />
        <button
        title="send"
          onClick={() => handleReply()}
         className="sendButton"
        >
        <img src="/icons/send.svg" alt="Reset votes" width="17" height="17" />
        </button>
      </div>
    </div>
  );
};

export default FeedbackPopup;
