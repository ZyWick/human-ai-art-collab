import React, { forwardRef, useState } from "react";
import colorMapping from "../../config/keywordTypes";

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
      ...style,
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
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colorMapping[type];
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isSelected ? colorMapping[type] : "transparent";
              e.target.style.color = isSelected ? "white" : colorMapping[type];
            }}
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
        style={{ border: "none", padding: "8px", fontSize: "14px",  outline: "none", maxWidth: "5em", flex: 1 }}
      />
      <button
        onClick={handleAdd}
        style={{ backgroundColor: "transparent", color: colorMapping[type], border: "none", borderLeft: `1px solid ${colorMapping[type]}`, padding: "8px 12px", fontSize: "14px", cursor: "pointer", transition: "background-color 0.3s" }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorMapping[type];
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = colorMapping[type];
        }}
      >
        +
      </button>
    </div>
  );
};

const NoteKeywordInput = ({ addKeywordSelection }) => {
  const [inputValue, setInputValue] = useState("");
  const typeOptions = ["Subject matter", "Theme & mood", "Action & pose"];
  const [selectedType, setSelectedType] = useState(typeOptions[0]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      addKeywordSelection(selectedType, inputValue);
      setInputValue("");
    }
  };

  return (
    <div className={"note-keywords-container"}>
        
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",}}>
      <div>
      <h5 style={{marginBlock: "0px", fontSize: "1em"}}>Add notes</h5>
      <p style={{ color: "rgb(136, 136, 136)", fontSize:"0.8em", margin: "0", marginBottom: "0.65em" }}>
        Add Keywords that you like
      </p>
    <div style={{ display: "inline-flex", width: "fit-content", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px"}}>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        style={{ width: "fit-content", color: "black", fontSize: "0.75em", border: "none", padding: "0.35em", marginRight: "0.4em",  outline: "none", backgroundColor: "white" }}
      >
        {typeOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ border: "none", padding: "8px", fontSize: "14px",  borderLeft: "0.5px solid #ccc", outline: "none", maxWidth: "5em", flex: 1 }}
      />
      <button
        onClick={handleAdd}
        style={{ backgroundColor: "transparent", width: "fit-content", border: "none", borderLeft: "0.5px solid #ccc", padding: "8px 12px", fontSize: "14px",  cursor: "pointer", transition: "background-color 0.3s" }}
          onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#ccc";
              e.target.style.color = "black";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor =  "transparent";
              e.target.style.color =  "black";
            }}
     >
        +
      </button>
    </div>
    </div></div>
    </div>
  );
};

export { KeywordButton, KeywordInput, NoteKeywordInput };