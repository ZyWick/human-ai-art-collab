import React, { useEffect, useRef, useMemo } from "react";

const ThreadInput = ({ position, value, onChange, onSubmit, onCancel }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const adjustedPosition = useMemo(() => ({
    x: Math.min(position.x, window.innerWidth - 265),
    y: Math.max(position.y, 40),
  }), [position]);
  

  return (
    <div
      style={{
        position: "absolute",
        top: adjustedPosition.y + 15,
        left: adjustedPosition.x - 15,
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
      style={{
        width: "30px",
        height: "30px",
        backgroundColor: "transparent",
        borderRadius: "50%",
        border: "1px solid grey"
      }}
    ></div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Check if the blur is caused by clicking the send button
          if (e.relatedTarget && e.relatedTarget.id === "send-button") {
            return;
          }
          onCancel();
        }}
        autoFocus
        placeholder="Add a comment"
        style={{
          fontSize: "16px",
          border: "1px solid grey",
          padding: "6px",
          backgroundColor: "#F5F5F5",
          outline: "none",
          borderRadius: "5px",
        }}
      />
      <button
      id="send-button"
        onClick={onSubmit}
        style={{
          width: "1.85em",
          height: "1.85em",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#555",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        //   boxShadow: "0px 2px 5px grey",
        }}
      >
        ↑
      </button>
    </div>
  );
};

export default ThreadInput;
