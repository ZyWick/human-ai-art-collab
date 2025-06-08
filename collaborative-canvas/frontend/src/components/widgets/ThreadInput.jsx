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
    x: Math.max(Math.min(position.x, window.innerWidth - 280), 40),
    y: Math.max(Math.min(position.y, window.innerHeight - 80 ), 40),
  }), [position]);
  

  return (
    <div
      style={{
        position: "absolute",
        top: adjustedPosition.y - 17.5,
        left: adjustedPosition.x - 17.5,
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
        border: "1.5px solid rgb(56, 49, 49)"
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
          fontSize: "14px",
          border: "0.75px solid rgb(56, 49, 49)",
          padding: "6px",
          backgroundColor: "white",
          outline: "none",
          borderRadius: "5px",
        }}
      />
      <button
      id="send-button"
        onClick={onSubmit}
       className="sendButton"
      >
        <img src="/icons/send.svg" alt="Reset votes" width="17" height="17" />
      </button>
    </div>
  );
};

export default ThreadInput;
