import React, { forwardRef, useState } from "react";
import colorMapping from "../config/keywordTypes";

const KeywordButton = forwardRef(
  ({ text, type, isSelected, isCustom, onClick, onDelete, style = {} }, ref) => {
    const baseStyle = {
      display: "flex",
      alignItems: "center",
      fontWeight: "normal",
      backgroundColor: isSelected ? colorMapping[type] : "transparent",
      color: isSelected ? "white" : colorMapping[type],
      border: `1px solid ${colorMapping[type]}`,
      borderRadius: "4px",
      overflow: "hidden",
      fontSize: "14px",
      fontFamily: "Noto Sans",
      cursor: "pointer",
      transition: "background-color 0.3s, color 0.3s",
      ...style,
    };

    const buttonStyle = {
      flex: 1,
      background: "inherit",
      color: "inherit",
      border: "none",
      padding: "0.5em 1em",
      textAlign: "center",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      transition: "background-color 0.3s, color 0.3s",
    };

    return (
      <div ref={ref} style={baseStyle}>
        <button
          onClick={onClick}
          style={buttonStyle}
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
        {isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ ...buttonStyle, borderLeft: `1px solid ${isSelected ? "white" : colorMapping[type]}` }}
          >
            ✖
          </button>
        )}
      </div>
    );
  }
);

const KeywordInput = ({ type, addKeywordSelection }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      addKeywordSelection(type, inputValue);
      setInputValue("");
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${colorMapping[type]}`, borderRadius: "4px", overflow: "hidden" }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ border: "none", padding: "8px", fontSize: "14px", fontFamily: "Noto Sans", outline: "none", maxWidth: "5em", flex: 1 }}
      />
      <button
        onClick={handleAdd}
        style={{ backgroundColor: "transparent", color: colorMapping[type], border: "none", borderLeft: `1px solid ${colorMapping[type]}`, padding: "8px 12px", fontSize: "14px", fontFamily: "Noto Sans", cursor: "pointer", transition: "background-color 0.3s" }}
      >
        +
      </button>
    </div>
  );
};

const NoteKeywordInput = ({ addKeywordSelection }) => {
  const [inputValue, setInputValue] = useState("");
  const typeOptions = ["Subject matter", "Theme & mood", "Action & pose", "Arrangement"];
  const [selectedType, setSelectedType] = useState(typeOptions[0]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      addKeywordSelection(selectedType, inputValue);
      setInputValue("");
    }
  };

  return (
    <div className={"note-keywords-container"} style={{width: "100%", marginTop: "auto",  marginBottom: "5.5em",}}>
    <hr
      style={{
        border: "none",
        minHeight: "0.05em",
        backgroundColor: "darkgrey",
        width: "100%",
      }}
    /><div style={{width: "90%", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",}}>
      <div style={{width: "90%",}}>
      <h3 style={{marginBlock: "0px", fontSize: "1.25em"}}>Add notes</h3><p style={{ color: "grey", margin: "0", marginBottom: "0.65em" }}>
        Add Keywords that you like
      </p>
    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid black", borderRadius: "4px", overflow: "hidden" }}>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        style={{ border: "none", padding: "0.5em", paddingRight: "2em", marginRight: "0.4em", fontSize: "14px", fontFamily: "Noto Sans", outline: "none", backgroundColor: "white" }}
      >
        {typeOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ border: "none", padding: "8px", fontSize: "14px", fontFamily: "Noto Sans", borderLeft: "0.5px solid black", outline: "none", maxWidth: "5em", flex: 1 }}
      />
      <button
        onClick={handleAdd}
        style={{ backgroundColor: "transparent", border: "none", borderLeft: "0.5px solid black", padding: "8px 12px", fontSize: "14px", fontFamily: "Noto Sans", cursor: "pointer", transition: "background-color 0.3s" }}
      >
        +
      </button>
    </div>
    </div></div>
    </div>
  );
};

export { KeywordButton, KeywordInput, NoteKeywordInput };