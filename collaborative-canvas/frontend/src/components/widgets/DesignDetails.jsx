import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from '../../context/SocketContext'
import { updateDesignDetails, updateDesignDetailsFull} from "../../redux/roomSlice";
import "../../assets/styles/dashboard.css";

const fields = [
  { key: "objective", label: "Project Overview", placeholder: "Briefly describe the project." },
  { key: "targetAudience", label: "Target Audience", placeholder: "Who is this for, and what are their needs?" },
  { key: "requirements", label: "Key Requirements", placeholder: "List essential features, elements, or guidelines." },
  { key: "constraints", label: "Constraints", placeholder: "What resources should we consider?" },
  { key: "others", label: "Other Specifications", placeholder: "Any additional considerations?" },
];

const DesignDetails = () => {
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const designDetails = useSelector((state) => state.room.designDetails);
  const [editingField, setEditingField] = useState(null);
  const textAreaRefs = useRef({}); 

  const handleBlur = (field, value) => {
    if (!value) return;
    const newValue = typeof value === "string" ? value.trim() : ""; 
    dispatch(updateDesignDetails, { [field]: newValue });
    dispatch(updateDesignDetailsFull, { [field]: newValue });
    socket.emit("updateDesignDetailsDone", { [field]: newValue});
    setEditingField(null);
  };

  const handleInputChange = (e, key) => {
    dispatch(updateDesignDetails, { [key]: e.target.value });
    socket.emit("updateDesignDetails", { [key]: e.target.value });
    resizeTextArea(key);
  };

  const resizeTextArea = (key) => {
    const textArea = textAreaRefs.current[key];
    if (textArea) {
      textArea.style.height = "auto"; // Reset height to recalculate
      textArea.style.height = `${textArea.scrollHeight}px`; // Adjust height dynamically
    }
  };

  return (
    <div
      className="scrollable-container"
      style={{
        display: "grid",
        gap: "1.5rem",
        // flexGrow: "2",
        // flexShrink: "1",
        width: "100%",
        maxHeight: "70%",
        // height: "100%"
      }}
    >
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{ fontSize: "0.9em", fontWeight: "bold", color: "#444" }}
          >
            {label}
          </label>
          {editingField === key ? (
            <textarea
              ref={(el) => (textAreaRefs.current[key] = el)}
              autoFocus
              value={designDetails[key] || ""}
              onChange={(e) => handleInputChange(e, key)}
              onBlur={(e) => handleBlur(key, e.target.value)}
              placeholder={placeholder}
              style={{
                fontSize: "0.9em",
                backgroundColor: "transparent",
                border: "1px solid #ccc",
                outline: "none",
                padding: "0.3em",
                width: "100%",
                fontStyle: designDetails[key] ? "normal" : "italic",
                color: designDetails[key] ? "black" : "#888",
                resize: "none",
                overflow: "hidden",
              }}
              rows={1}
            />
          ) : (
            <div
              onClick={() => setEditingField(key)}
              style={{
                fontSize: "0.9em",
                minHeight: "24px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                paddingInline: "0.2em",
                color: designDetails[key] ? "black" : "#888",
                fontStyle: designDetails[key] ? "normal" : "italic",
              }}
            >
              {designDetails[key] || placeholder}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesignDetails;
