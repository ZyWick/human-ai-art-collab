import React, { forwardRef, useState, useEffect } from "react";
import colorMapping from "../config/keywordTypes";
import { createKeywordManual } from "../util/api";

const KeywordButton = forwardRef(
  ({ text, type, isSelected, onClick, style = {} }, ref) => {
    useEffect(() => {
        console.log("KeywordButton re-rendered:", text, isSelected);
      }, [isSelected]);
      
    
    return (
      <button
        ref={ref}
        onClick={onClick}
        style={{
          fontWeight: "normal",
          backgroundColor: isSelected ? colorMapping[type] : "transparent",
          color: isSelected ? "white" : colorMapping[type],
          border: `1px solid ${colorMapping[type]}`,
          borderRadius: "4px",
          padding: "8px 12px",
          fontSize: "14px",
          fontFamily: "Noto Sans",
          cursor: "pointer",
          transition: "background-color 0.3s, color 0.3s",
          ...style,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorMapping[type];
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = isSelected ? colorMapping[type] : "transparent";
          e.target.style.color = isSelected ? "white" : colorMapping[type];
        }}
      >
        {text}
      </button>
    );
  }
);

const KeywordInput = ({ type, boardId, imageId, addKeywordSelection }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = async () => {
    if (inputValue.trim() !== "") {
       addKeywordSelection(type, inputValue)
        setInputValue("");
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", width: "auto", border: `1px solid ${colorMapping[type]}`, borderRadius: "4px", overflow: "hidden" }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          border: "none",
          padding: "8px",
          fontSize: "14px",
          fontFamily: "Noto Sans",
          outline: "none",
          maxWidth: "5em",
          flex: 1,
        }}
      />
      <button
        onClick={handleAdd}
        style={{
          backgroundColor: "transparent",
          color: colorMapping[type],
          border: "none",
          borderLeft: `1px solid ${colorMapping[type]}`,
          padding: "8px 12px",
          fontSize: "14px",
          fontFamily: "Noto Sans",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => {
            e.target.style.backgroundColor = colorMapping[type];
            e.target.style.color = "white";
          }}
        onMouseLeave={(e) => {
            e.target.style.backgroundColor = "white";
            e.target.style.color = colorMapping[type];
          }}
      >
        +
      </button>
    </div>
  );
};

const NoteKeywordInput = ({  addKeywordSelection }) => {
  const [inputValue, setInputValue] = useState("");
  const typeOptions = ["Subject matter", "Theme & mood", "Action & pose", "Arrangement"]
  const [selectedType, setSelectedType] = useState(typeOptions[0]);

  const handleAdd = async () => {
    if (inputValue.trim() !== "") {
      addKeywordSelection(selectedType, inputValue);
      setInputValue("");
    }
  };

  return (
    <div style={{ marginBottom: "3.5em", display: "inline-flex", alignItems: "center", width: "auto", border: `1px solid black`, borderRadius: "4px", overflow: "hidden" }}>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        style={{
          border: "none",
          padding: "0.5em",
          paddingRight: "2em",
          marginRight: "0.4em",
          fontSize: "14px",
          fontFamily: "Noto Sans",
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
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          border: "none",
          padding: "8px",
          fontSize: "14px",
          fontFamily: "Noto Sans",
          borderLeft: `0.5px solid black`,
          outline: "none",
          maxWidth: "5em",
          flex: 1,
        }}
      />
      <button
        onClick={handleAdd}
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderLeft: `0.5px solid black`,
          padding: "8px 12px",
          fontSize: "14px",
          fontFamily: "Noto Sans",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "black";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "white";
          e.target.style.color = "black";
        }}
      >
        +
      </button>
    </div>
  );
};

export default KeywordInput;

export { KeywordButton, KeywordInput, NoteKeywordInput };
