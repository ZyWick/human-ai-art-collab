import React, { forwardRef, useState } from "react";
import colorMapping from "../../config/keywordTypes";
import "../../assets/styles/kwButton.css";

const KeywordButton = forwardRef(
  (
    {
      text,
      type,
      isSelected,
      isCustom,
      onClick,
      onDelete,
      fontSize,
      style = {},
    },
    ref
  ) => {
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
          style={{ fontSize }}
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
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${colorMapping[type]}`,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          border: "none",
          padding: "8px",
          fontSize: "14px",
          color: `${colorMapping[type]}`,
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
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
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



export { KeywordButton, KeywordInput };
