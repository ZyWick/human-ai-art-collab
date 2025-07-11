import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { KeywordButton } from "./KeywordButton";
import OutputImage from "./OutputImage";
import colorMapping from "../../config/keywordTypes";
import "../../assets/styles/imageHistory.css";

const IterationsPopup = ({ currBoard, setShowAllIterations }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [size, setSize] = useState({
    width: 670,
    height: window.innerHeight / 2,
  });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [showKeywords, setShowKeywords] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (popupRef.current) {
      const { offsetWidth } = popupRef.current;
      setPosition({
        x: window.innerWidth / 2 - offsetWidth / 2,
        y: window.innerHeight * 0.15,
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
          x: Math.max(
            0,
            Math.min(e.clientX - offset.x, window.innerWidth - offsetWidth)
          ),
          y: Math.max(
            0,
            Math.min(e.clientY - offset.y, window.innerHeight - offsetHeight)
          ),
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
        zIndex: 1000,
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
              {showKeywords ? "| Hide input" : "| Show input"}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <p style={{ color: "grey", visibility: "hidden" }}>
                    #{currBoard.iterations.length - iterIndex}
                  </p>
                  <div
                    style={{
                      marginLeft: "10px",
                      paddingLeft: "10px",
                      borderLeft: "2px solid transparent",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5em",
                    }}
                  >
                    <div className="image-container-all">
                      {iter.generatedImages.map((image, index) => (
                        <OutputImage
                          image={image}
                          prompt={iter.prompt[index]}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="iter-meta">
                  <p className="iter-number">
                    #{currBoard.iterations.length - iterIndex}
                  </p>

                  <div className="keyword-container-history">
                    {iter.keywords?.map((keyword) => (
                      <div style={{display:"flex"}}>
                      <KeywordButton
                        key={keyword._id}
                        text={keyword.keyword}
                        type={keyword.type}
                        isSelected={true}
                        style={{borderTopRightRadius: '0', borderBottomRightRadius: '0'}}
                      />
                      <div
                        style={{
                          backgroundColor: colorMapping[keyword.type],
                          color: "white",
                          border: "none",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                          borderLeft: `1px solid white`,
                          padding: "8px 12px",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {keyword.vote}
                      </div></div>
                    ))}
                  </div>
                </div>
                  <DesignBrief text={iter.brief}></DesignBrief>
              </div>
            ))
          : iterations.map(
              (iter, iterIndex) =>
                iter.generatedImages.length > 0 && (
                  <div key={iter._id} className="board-row">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
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
                            <OutputImage
                              image={image}
                              prompt={iter.prompt[index]}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
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

const DesignBrief = ({ text }) => {
const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const computeTruncation = () => {
      const style = window.getComputedStyle(contentRef.current);
      const lineHeight = parseFloat(style.lineHeight);
      const maxHeight = 2 * lineHeight;

      if (contentRef.current.scrollHeight > maxHeight + 1) {
        setIsTruncated(true);
      }
    };

    // Defer to ensure DOM is ready
    setTimeout(computeTruncation, 0);
  }, [text]);

  const textStyle = {
    marginLeft: "30px",
    maxWidth: "90%",
    padding: "5px 10px",
    cursor: isTruncated ? 'pointer' : 'default',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: expanded ? 'unset' : 2,
    WebkitBoxOrient: 'vertical',
    whiteSpace: expanded ? 'normal' : 'initial',
    lineHeight: '1.5em',
    maxHeight: expanded ? 'none' : '3em',
    transition: 'max-height 0.3s ease',
    fontStyle: "italic",
    color: "#555"
  };

    const handleToggle = () => {
    if (isTruncated) {
      setExpanded(prev => !prev);
    }
  };


  return text &&
    <div
      ref={contentRef}
      className={isTruncated ? "commonButton": ""}
      style={textStyle}
            onClick={handleToggle}
    >
      {`brief: ${text}`}
    </div>
  ;
};

export default IterationsPopup;
