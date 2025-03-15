import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from '../../context/SocketContext';
import { selectBoardById } from "../../redux/boardsSlice";
import { useAuth } from "../../context/AuthContext";

const ChatBox = ({ chatRef }) => {
  const socket = useSocket();
  const { userId, roomChat, designDetails, currentBoardId } = useSelector((state) => state.room);
  const currBoard = useSelector((state) => selectBoardById(state, currentBoardId));
  const { user } = useAuth();

  const boardName = currBoard?.name || "No Board Selected";
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("currentBoard");
  const boardChat = roomChat?.filter((chat) => chat.boardId?._id === currentBoardId) || [];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [roomChat, chatRef, activeTab]);

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      const newMessage = {
        userId,
        username: user.username,
        boardId: currentBoardId,
        boardName,
        message: input
      };
      socket.emit("sendChat", newMessage);
      setInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        // flexShrink: "2",
        minHeight: "2em",
        maxHeight: "32.5%",
        width: "95%",
        marginTop: "1em",
        paddingBottom: "2em"
      }}
    >
      {/* Tab Navigation */}
      <div style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: "0.5em" }}>
        <button
          onClick={() => setActiveTab("currentBoard")}
          style={{
            flex: 1,
            padding: "0.5em",
            border: "none",
            backgroundColor: activeTab === "currentBoard" ? "#007bff" : "#ddd",
            color: activeTab === "currentBoard" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "4px 0 0 4px"
          }}
        >
          {boardName}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            flex: 1,
            padding: "0.5em",
            border: "none",
            backgroundColor: activeTab === "all" ? "#007bff" : "#ddd",
            color: activeTab === "all" ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: "0 4px 4px 0"
          }}
        >
          All
        </button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatRef}
        className="scrollable-container"
        style={{
          width: "100%",
          overflowY: "auto",
          border: "1px solid lightgrey",
          borderRadius: "4px",
          padding: "0.5em",
          backgroundColor: "rgb(249, 249, 249)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {(activeTab === "all" ? roomChat : boardChat).map((chat, index) => (
          <p key={index} style={{ marginBlock: "0.2em" }}>
            {activeTab === "all" && (
              <span style={{ color: "#555", fontWeight: "bold" }}>
                [{chat.boardId === currentBoardId ? boardName : `${chat.boardId?.name}`}]{" "}
              </span>
            )}
            <strong>{chat.username}:</strong> {chat.message}
          </p>
        ))}
      </div>

      {/* Message Input */}
      <textarea
        style={{
          width: "100%",
          minHeight: "10%",
          padding: "0.5em",
          borderRadius: "4px",
          border: "1px solid lightgrey"
        }}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatBox;
