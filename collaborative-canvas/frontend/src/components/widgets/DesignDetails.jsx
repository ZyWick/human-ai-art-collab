import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import {
  updateDesignDetails,
  updateDesignDetailsFull,
} from "../../redux/roomSlice";
import "../../assets/styles/dashboard.css";

const fields = [
  {
    key: "objective",
    label: "Design brief",
    placeholder: "Briefly describe the project.",
  },
];

const DesignDetails = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const designDetails = useSelector((state) => state.room.designDetails);
  const [editingField, setEditingField] = useState(null);
  const textAreaRefs = useRef({});

  const handleBlur = (field, value) => {
  const newValue = typeof value === "string" ? value.trim() : "";
  if (!newValue || newValue === designDetails[field]) {
    setEditingField(null);
    return;
  }

  dispatch(updateDesignDetails, { [field]: newValue });
  dispatch(updateDesignDetailsFull, { [field]: newValue });
  socket.emit("updateDesignDetailsDone", { [field]: newValue });
  setEditingField(null);
};

  const handleInputChange = (e, key) => {
    dispatch(updateDesignDetails, { [key]: e.target.value });
    socket.emit("updateDesignDetails", { [key]: e.target.value });
  };

  return (
    <>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <label
            style={{
              fontSize: "0.9em",
              fontWeight: "bold",
              paddingLeft: "0.5em",
              color: "#444",
              marginBottom: "0.25em",
            }}
          >
            {label}
          </label>
          {editingField === key ? (
            <textarea
              ref={(el) => {
                textAreaRefs.current[key] = el;
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
              value={designDetails[key] || ""}
              onChange={(e) => handleInputChange(e, key)}
              onBlur={(e) => handleBlur(key, e.target.value)}
              autoFocus
              style={{
                fontSize: "1.1em",
                minHeight: "24px",
                padding: "0.5em 0.65em",
                boxSizing: "border-box",
                border: "1px solid #2684FF",
                borderRadius: "4px",
                outline: "none",
                width: "100%",
                overflow: "hidden",
              }}
            />
          ) : (
            <HoverableWrapper
              isEditing={editingField === key}
              className="scrollable-container"
            >
              <div
                onClick={() => setEditingField(key)}
                style={{
                  fontSize: "0.9em",
                  cursor: "pointer",
                  wordBreak: "break-word",
                  color: designDetails[key] ? "black" : "#888",
                  fontStyle: designDetails[key] ? "normal" : "italic",
                }}
              >
                {designDetails[key] || placeholder}
              </div>
            </HoverableWrapper>
          )}
        </div>
      ))}
    </>
  );
};

const HoverableWrapper = ({ className, style, isEditing, children }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...style,
        padding: "0.3em 0.6em",
        borderRadius: "4px",
        transition: "background-color 0.2s",
        cursor: "pointer",
        backgroundColor: isEditing
          ? "white"
          : hover
          ? "#f0f0f0"
          : "transparent",
      }}
    >
      {children}
    </div>
  );
};

export default DesignDetails;
