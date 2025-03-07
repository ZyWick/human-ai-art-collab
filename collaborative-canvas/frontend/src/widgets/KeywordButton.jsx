import React, {forwardRef} from "react";
import colorMapping from "../config/keywordTypes";
const KeywordButton = forwardRef(({ text, type, isSelected, onClick, style = {} }, ref) => {
  return (
    <button ref={ref}
      onClick={onClick}
      style={{
        fontWeight: isSelected ? "bold" : "normal", // Bold when selected
        backgroundColor: isSelected ? colorMapping[type] : "transparent",
        color: isSelected ? "white" : colorMapping[type],
        border: `1px solid ${colorMapping[type]}`,
        borderRadius: "4px",
        padding: "8px 12px",
        fontSize: "14px",
        fontFamily: "Noto Sans",
        cursor: "pointer",
        ...style,
      }}
    >
      {text}
    </button>
  );
});

export default KeywordButton;
