import React, { forwardRef, useState } from "react";
import colorMapping from "../../config/keywordTypes";
import '../../assets/styles/kwButton.css'

const KeywordButton = forwardRef(
  ({ text, type, isSelected, isCustom, onClick, onDelete,fontSize, style = {} }, ref) => {
    return (
      <div
        ref={ref}
        className={`keyword-button ${isSelected ? "selected" : ""}`}
        style={{
          "--color": colorMapping[type],
          borderRadius: "4px",
          overflow: "hidden",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          fontWeight: "normal",
          ...style,
        }}
      >
        <button
          onClick={onClick}
          className="keyword-button-main"
          type="button"
          style={{fontSize}}
        >
          {text}
        </button>
        {isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="keyword-button-delete"
            type="button"
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
      <h5 style={{marginBlock: "0px", fontSize: "1em"}}>Add Keywords</h5>
      <p style={{ color: "rgb(136, 136, 136)", fontSize:"0.8em", margin: "0", marginBottom: "0.65em" }}>
        Add keywords that you like
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
        maxLength={125}
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