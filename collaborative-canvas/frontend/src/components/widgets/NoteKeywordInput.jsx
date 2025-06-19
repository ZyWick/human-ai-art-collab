import { useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/kwButton.css";

export default function NoteKeywordInput() {
  const socket = useSocket();
  const { user } = useAuth();
  const boardId = useSelector((state) => state.room.currentBoardId);
  const [inputValue, setInputValue] = useState("");
  const typeOptions = ["Subject matter", "Theme & mood", "Action & pose"];
  const [selectedType, setSelectedType] = useState(typeOptions[0]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      addKeywordSelection(selectedType, inputValue);
      setInputValue("");
    }
  };

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = {
      boardId: boardId,
      type,
      keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
      author: user.username,
    };
    socket.emit("newKeyword", newKeyword);
  };

  return (
    <div className={"note-keywords-container"}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>
          <h5 style={{ marginBlock: "0px", fontSize: "1em" }}>Add Keywords</h5>
          <p
            style={{
              color: "rgb(136, 136, 136)",
              fontSize: "0.8em",
              margin: "0",
              marginBottom: "0.65em",
            }}
          >
            Add keywords that you like
          </p>
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: "fit-content",
                color: "black",
                fontSize: "0.75em",
                border: "none",
                padding: "0.35em",
                marginRight: "0.4em",
                outline: "none",
                backgroundColor: "white",
              }}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={inputValue}
              maxLength={125}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}
              style={{
                border: "none",
                padding: "8px",
                fontSize: "14px",
                borderLeft: "0.5px solid #ccc",
                outline: "none",
                maxWidth: "5em",
                flex: 1,
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: "transparent",
                width: "fit-content",
                border: "none",
                borderLeft: "0.5px solid #ccc",
                padding: "8px 12px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ccc";
                e.target.style.color = "black";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "black";
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
