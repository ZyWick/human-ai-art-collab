import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

const AddComments = ({handleCommentSubmit}) => {
    const [inputPosition, setInputPosition] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);
    const {stagePosition, stagePointerPosition} = useSelector((state) => state.room);
    const isAddingComments = useSelector((state) => state.room.isAddingComments);
  
    console.log({stagePosition, stagePointerPosition})
    // const handleDragMove = (e) => {
    //   const stage = e.target;
    //   const newPos = stage.position();
    //   setStagePosition(newPos);
  
    //   // Adjust input field position when dragging
    //   if (inputPosition) {
    //     setInputPosition({
    //       ...inputPosition,
    //       x: inputPosition.relativeX + newPos.x,
    //       y: inputPosition.relativeY + newPos.y,
    //     });
    //   }
    // };

    useEffect(() => {
        if (inputPosition) {
          // Update input position when stage moves
          setInputPosition((prev) => ({
            ...prev,
            x: prev.relativeX + stagePosition.x,
            y: prev.relativeY + stagePosition.y,
          }));
        }
      }, [stagePosition]);
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

  
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCommentSubmit();
      }
    };

    return inputPosition && (
        <div
          style={{
            position: "absolute",
            top: inputPosition.y,
            left: inputPosition.x,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
            border: "1px solid grey",
            borderRadius: "0.5em",
            backgroundColor: "#F5F5F5",
              width: "20%"
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              backgroundColor: "transparent",
              fontSize: "0.8em",
              border: "none",
              paddingInline: "1em",
              paddingBlock: "0.65em",
              outline: "none",
              width: "70%"
            }}
            placeholder="Add a comment"
          />
          <button
            onClick={handleCommentSubmit}
            style={{
              width: "24px",
              height: "24px",
              marginRight: "0.5em",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "darkgrey",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          >
            ↑
          </button>
        </div>
      )
}

export default AddComments;