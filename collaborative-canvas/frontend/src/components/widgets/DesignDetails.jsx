import React, { useState, useRef, useEffect } from "react";
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
  const [hover, setHover] = useState(false);
  const [localValues, setLocalValues] = useState({});

  const handleBlur = (field, value) => {
    const newValue = typeof value === "string" ? value.trim() : "";
    if (!newValue) {
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

  const justFocused = useRef(false);

  useEffect(() => {
    if (editingField && textAreaRefs.current[editingField]) {
      const el = textAreaRefs.current[editingField];

      el.style.height = "auto";
      el.style.height = `${Math.ceil(el.scrollHeight)}px`;

      if (justFocused.current) {
        el.setSelectionRange(el.value.length, el.value.length);
        el.focus();
        justFocused.current = false;
      }
    }
  }, [editingField]);

  return (
    <>
      {fields.map(({ key, label, placeholder }) => (
        <div
          onMouseLeave={() => setHover(false)}
          key={key}
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
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
              className="designbrief-text-matching-style scrollable-container"
              rows={1}
              ref={(el) => {
                textAreaRefs.current[key] = el;
              }}
              value={localValues[key] || ""}
              onChange={(e) => {
                setLocalValues((prev) => ({ ...prev, [key]: e.target.value }));
                handleInputChange(e, key);
              }}
              onBlur={(e) => handleBlur(key, localValues[key])}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Briefly describe the project."
              autoFocus
              style={{
                paddingBottom: "0.45em",
                boxSizing: "border-box",
                border: "1px solid #2684FF",
                outline: "none",
                resize: "none",
                fontStyle: designDetails[key] ? "normal" : "italic",
              }}
            />
          ) : (
            <div
              className="scrollable-container designbrief-text-matching-style"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => {
                setLocalValues((prev) => ({
                  ...prev,
                  [key]: designDetails[key] || "",
                }));
                setEditingField(key);
                justFocused.current = true;
              }}
              style={{
                transition: "color 0.2s",
                cursor: "text",
                border: hover ? "1px solid darkgrey" : "1px solid transparent",
                color: designDetails[key] ? "black" : "#888",
                fontStyle: designDetails[key] ? "normal" : "italic",
              }}
            >
              {designDetails[key] || placeholder}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default DesignDetails;
