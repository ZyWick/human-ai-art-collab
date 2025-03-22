import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { KeywordButton } from "./KeywordButton";
import "../../assets/styles/imageHistory.css";

const IterationsPopup = ({ currBoard, setShowAllIterations }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [size, setSize] = useState({ width: 670, height: window.innerHeight / 2 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [showKeywords, setShowKeywords] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (popupRef.current) {
      const { offsetWidth, offsetHeight } = popupRef.current;
      setPosition({
        x: window.innerWidth / 2 - offsetWidth / 2,
        y: window.innerHeight / 2 - offsetHeight / 2,
      });
    }
  }, []);

  // Handle Dragging
  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (dragging) {
        const { offsetWidth, offsetHeight } = popupRef.current || {};
        setPosition({
          x: Math.max(0, Math.min(e.clientX - offset.x, window.innerWidth - offsetWidth)),
          y: Math.max(0, Math.min(e.clientY - offset.y, window.innerHeight - offsetHeight)),
        });
      } else if (resizing) {
        setSize({
          width: Math.max(400, e.clientX - position.x), // Min width 400px
          height: Math.max(300, e.clientY - position.y), // Min height 300px
        });
      }
    },
    [dragging, resizing, position, offset]
  );

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing, handleMouseMove]);

  const iterations = useMemo(
    () => currBoard?.iterations?.slice().reverse() || [],
    [currBoard]
  );

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: "12px",
        padding: "16px",
        paddingTop: "8px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)",
        zIndex: 100,
        minWidth: "670px",
        minHeight: "400px",
        width: `${size.width}px`,
        height: `${size.height}px`,
        wordWrap: "break-word",
        resize: "none",
        cursor: dragging ? "grabbing" : null,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          paddingBottom: "8px",
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        <div>
          <strong style={{ fontSize: "16px", color: "#222" }}>
            Version history
          </strong>
          <button
            onClick={() => setShowKeywords(!showKeywords)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              background: "none",
              color: "#222",
              cursor: "pointer",
              transition: "background 0.2s",
              marginLeft: "5px",
            }}
            title="Close"
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <div style={{ color: "grey" }}>
              {showKeywords ? "| Hide keywords" : "| Show keywords"}
            </div>
          </button>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowAllIterations(false)}
            style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              background: "none",
              color: "#222",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Close"
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{ maxHeight: "90%" }} className="the-scrollable-container">
        {showKeywords
          ? iterations.map((iter, iterIndex) => (
              <div key={iter._id} className="board-row">
                <div className="image-container-all">
                  {iter.generatedImages.map((image, index) => (
                    <img
                      key={index}
                      className="the-row-image"
                      alt=""
                      src={image}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ color: "grey" }}>
                    #{currBoard.iterations.length - iterIndex}
                  </p>
                  <div
                    style={{
                      marginLeft: "10px",
                      paddingLeft: "10px",
                      borderLeft: "2px solid rgba(0, 0, 0, 0.15)",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5em",
                    }}
                  >
                    {iter.keywords &&
                      iter.keywords.length > 0 &&
                      iter.keywords.map((keyword) => (
                        <KeywordButton
                          key={keyword._id}
                          text={keyword.keyword}
                          type={keyword.type}
                          isSelected={true}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))
          : iterations.map((iter, iterIndex) => (
              <div key={iter._id} className="board-row">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ color: "grey" }}>
                    #{currBoard.iterations.length - iterIndex}
                  </p>
                  <div
                    style={{
                      marginLeft: "10px",
                      paddingLeft: "10px",
                      borderLeft: "2px solid rgba(0, 0, 0, 0.15)",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5em",
                    }}
                  >
                    <div className="image-container-all">
                      {iter.generatedImages.map((image, index) => (
                        <img
                          key={index}
                          className="the-row-image"
                          // style={{ maxWidth: "18.35%" }}
                          alt=""
                          src={image}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
            {/* Resize Handle */}
            <div
        style={{
          position: "absolute",
          bottom: "5px",
          right: "15px",
          width: "15px",
          height: "15px",
          background: "rgba(0,0,0,0.1)",
          cursor: "nwse-resize",
          borderRadius: "3px",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setResizing(true);
        }}
      />
    </div>
  );
};

export default IterationsPopup;
