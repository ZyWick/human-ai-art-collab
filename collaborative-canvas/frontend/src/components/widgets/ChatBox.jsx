import React, { useState, useEffect, } from "react";
import { useSelector, } from "react-redux";
import { useSocket } from '../../context/SocketContext'
import { selectBoardById } from "../../redux/boardsSlice";
import { useAuth } from "../../context/AuthContext";

const ChatBox = ({chatRef}) => {
  const socket = useSocket();
//   const dispatch = useDispatch();
  const {userId, roomChat, designDetails, currentBoardId} = useSelector((state) => state.room);  
  const currBoard = useSelector((state) =>
    selectBoardById(state, currentBoardId)
  );
  const { user } = useAuth();

  const boardName = currBoard?.name;
  const [input, setInput] = useState("");
  const [forceRerender, setForceRerender] = useState(0)

useEffect (() => {
    setForceRerender((prev) => prev + 1);
}, [designDetails])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [roomChat, chatRef]);

  const handleSendMessage = () => {
    if (input.trim() !== "") {
    const newMessage =  {userId: userId, username: user.username, boardId: currentBoardId, boardName, message: input}
      socket.emit("sendChat", newMessage)
      setInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
      console.log("tf")
    }
  };

  return (
    <div
    key={forceRerender}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        flexShrink: "2",
        minHeight: "2em",
        height: "100%",
        width: "95%",
        paddingBottom: "2em"
        // marginTop: "auto",
      }}
    >
      <h3
        style={{
          margin: "0",
          fontSize: "1.5em",
          marginBottom: "0",
          marginTop: "1em",
        }}
      >
        Chat
      </h3>
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
          flexDirection: "column",
        }}
      >
        {roomChat?.map((chat, index) => (
          <p key={index} style={{ marginBlock: "0.2em" }}>
          <strong>
            <span style={{ color: "#555" }}>[{chat.boardId?.name}] </span>
            {chat.username}:
          </strong>{" "}
          {chat.message}
        </p>
        
        ))}
      </div>
      <textarea
        style={{
          width: "100%",
          minHeight: "10%",
          padding: "0.5em",
          borderRadius: "4px",
          border: "1px solid lightgrey",
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
