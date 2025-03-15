import { useState, useEffect, useRef } from "react";
import "../../assets/styles/BoardsList.css";
import colorMapping from "../../config/keywordTypes";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById } from "../../redux/boardsSlice";
import { useSelector } from "react-redux";

const ImageFeedback = ({ selectedImage }) => {
  const [input, setInput] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const { currentBoardId } = useSelector((state) => state.room);
  const feedbackRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();
  const currBoard = useSelector((state) => selectBoardById(state, currentBoardId));
  const boardName = currBoard?.name || "No Board Selected";
  const feedbacks = selectedImage.feedback
  
    useEffect(() => {
      if (feedbackRef.current) {
        feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight;
      }
    }, [feedbacks]);

    // Handle Enter key to send messages
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent new line in textarea
        handleSendMessage();
      }
    };

    const handleSendMessage = () => {
      if (input.trim() === "") return;
        const newMessage = {
          imageId: selectedImage._id,
          userId: user.id,
          username: user.username,
          boardId: currentBoardId,
          keywordType: selectedKeyword.type,
          keyword: selectedKeyword.keyword,
          message: input
        };
        socket.emit("sendImageChat", newMessage);
      setInput(""); // Clear input after sending
    };

  return (
    <div
      className="feedback-container"
      style={{ display: "flex", flexDirection: "column", height: "100%", width: "90%" }}
    >
      <div
        ref={feedbackRef}
        className="scrollable-container"
        style={{
          flex: 1,
          width: "90%",
          overflowY: "auto",
          border: "1px solid lightgrey",
          borderRadius: "4px",
          padding: "0.5em",
          backgroundColor: "rgb(249, 249, 249)",
          display: "flex",
          flexDirection: "column",
        }}
      >
      {feedbacks.map((chat, index) => (
  <p key={index} style={{ marginBlock: "0.2em" }}>
    <strong>
      {chat.keyword ? (
        <span style={{ color: colorMapping[chat.keywordType] }}>
          [{chat.keywordType}: {chat.keyword}]
        </span>
      ) : ""}
       {` ${chat.username}`}:
    </strong> {chat.message}
  </p>
))}


      </div>

      {/* Message Input */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "1px solid black",
          borderRadius: "4px",
          overflow: "hidden",
          width: "90%",
          paddingInline: "0.5em"
        }}
      >
        <select
        value={selectedKeyword ? selectedKeyword._id : ""}
        onChange={(e) => {
            const selectedKw = selectedImage.keywords.find((kw) => kw._id === e.target.value);
            setSelectedKeyword(selectedKw || {});
        }}
        style={{ border: "none", padding: "0.5em", paddingRight: "2em", marginRight: "0.4em", fontSize: "14px", fontFamily: "Noto Sans", outline: "none", backgroundColor: "white" }}
        >
        <option value="">Select a keyword</option>
        {selectedImage.keywords.map((kw) => (
            <option key={kw._id} value={kw._id}>
            {`${kw.type}: ${kw.keyword}`}
            </option>
        ))}
        </select>

      </div>
      <textarea
        style={{
          width: "91%",
          minHeight: "10%",
          padding: "0.5em",
          borderRadius: "4px",
          border: "1px solid lightgrey",
          marginBottom: "4em",
        }}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ImageFeedback;
