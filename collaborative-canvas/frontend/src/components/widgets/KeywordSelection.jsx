import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import { KeywordButton, KeywordInput } from "./KeywordButton";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import "../../assets/styles/keywordSelection.css";
import {
  selectKeywordsByImage,
  updateKeyword,
} from "../../redux/keywordsSlice";
import { removeSelectedKeyword } from "../../redux/selectionSlice";
import { selectImageById } from "../../redux/imagesSlice";
import { useAuth } from "../../context/AuthContext";

const KeywordSelection = ({ keywordSelectionData, onClose }) => {
  const selectedImage = useSelector((state) =>
    selectImageById(state, keywordSelectionData._id)
  );
  const [position, setPosition] = useState(keywordSelectionData.position);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { user } = useAuth();

  const keywordRefs = useRef({});
  const kwSelectionRef = useRef();
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();
  const imageKeywords = useSelector((state) =>
    selectKeywordsByImage(state, selectedImage)
  );
  const [likedElementTypes, setLikedElementTypes] = useState({});

  useEffect(() => {
    if (!imageKeywords) return;

    const now = Date.now();

    const updatedLikes = imageKeywords.reduce((acc, keyword) => {
      const hasPosition =
        keyword.offsetX !== undefined && keyword.offsetY !== undefined;
      const isRecentCustom =
        keyword.isCustom && now - new Date(keyword.createdAt).getTime() < 3000;
      if (hasPosition || isRecentCustom) acc[keyword.type] = true;

      return acc;
    }, {});

    setLikedElementTypes(updatedLikes);
  }, [imageKeywords]);

  const groupedKeywords = useMemo(() => {
    const requiredTypes = ["Action & pose", "Subject matter", "Theme & mood"];
    const grouped = (imageKeywords || []).reduce((acc, keyword) => {
      acc[keyword.type] = acc[keyword.type] || [];
      acc[keyword.type].push(keyword);
      return acc;
    }, {});

    requiredTypes.forEach((type) => {
      if (!grouped[type]) grouped[type] = [];
    });

    return grouped;
  }, [imageKeywords]);

  const handleKeywordRemoval = useCallback(
    (keyword) => {
      dispatch(removeSelectedKeyword, keyword._id);
      dispatch(updateKeyword, {
        id: keyword._id,
        changes: {
          offsetX: undefined,
          offsetY: undefined,
          isSelected: false,
          votes: [],
          downvotes: [],
          author: "",
        },
      });
      socket.emit("removeKeywordFromBoard", keyword._id);
    },
    [dispatch, socket]
  );

  useEffect(() => {
    for (const key in likedElementTypes) {
      if (likedElementTypes[key] === false) {
        groupedKeywords[key].forEach((kw) => {
          if (kw.offsetX !== undefined && kw.offsetY !== undefined) {
            handleKeywordRemoval(kw);
          }
        });
      }
    }
  }, [likedElementTypes, groupedKeywords, handleKeywordRemoval]);

  useEffect(() => {
    if (kwSelectionRef.current) {
      const { width, height } = kwSelectionRef.current.getBoundingClientRect();
      const newPosition = {
        x: Math.min(
          keywordSelectionData.position.x,
          window.innerWidth - width - 10
        ),
        y: Math.max(
          7.5,
          Math.min(
            keywordSelectionData.position.y,
            window.innerHeight - height - 10
          )
        ),
      };
      setPosition(newPosition);
    }
  }, [keywordSelectionData.position]);

  useEffect(() => {
    const element = kwSelectionRef.current;
    if (!element) return;

    let animationFrame = null;

    const updatePosition = () => {
      if (!element) return;

      const { width, height } = element.getBoundingClientRect();
      animationFrame = requestAnimationFrame(() => {
        setPosition((prev) => {
          let newX = prev.x;
          let newY = prev.y;
          const maxX = window.innerWidth - width - 10;
          const maxY = window.innerHeight - height - 10;

          // Only adjust if out of bounds
          if (prev.x > maxX) newX = maxX;
          if (prev.y > maxY) newY = maxY;

          // Prevent re-renders unless position actually changed
          if (newX !== prev.x || newY !== prev.y) {
            return { x: newX, y: newY };
          }

          return prev;
        });
      });
    };

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(element);

    // Optional: run once to correct initial layout
    updatePosition();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [kwSelectionRef]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging || !kwSelectionRef.current) return;

      const { offsetWidth, offsetHeight } = kwSelectionRef.current;
      const maxX = window.innerWidth - offsetWidth;
      const maxY = window.innerHeight - offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(e.clientX - offset.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - offset.y, maxY)),
      });
    },
    [dragging, offset]
  );

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove]);

  const toggleLikedElementType = (type) => {
    setLikedElementTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const getRandomPoint = (w, h) => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * Math.max(w, h);
    return {
      x: w / 2 + radius * Math.cos(angle),
      y: h / 2 + radius * Math.sin(angle),
    };
  };

  const toggleOnBoard = (keyword) => {
    if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
      handleKeywordRemoval(keyword);
      return;
    }

    const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
    const { x, y } = getRandomPoint(selectedImage.width, selectedImage.height);
    const { offsetX, offsetY } = calculateNewKeywordPosition(
      x,
      y,
      bbox?.width || 50,
      bbox?.height || 20,
      selectedImage.width,
      selectedImage.height
    );

    const update = {
      id: keyword._id,
      changes: { offsetX, offsetY, author: user.username },
    };
    dispatch(updateKeyword, update);
    socket.emit("updateKeywordOffset", update);
  };

  const deleteCustom = (keyword) => {
    socket.emit("deleteKeyword", {
      imageId: selectedImage._id,
      keywordId: keyword._id,
    });
  };

  const addKeywordSelection = (type, newKeywordText) => {
    socket.emit("newKeyword", {
      boardId: selectedImage.boardId,
      imageId: selectedImage._id,
      isCustom: true,
      type,
      keyword: newKeywordText,
    });
  };

  return (
    selectedImage && (
      <div
        ref={kwSelectionRef}
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          zIndex: 150,
          width: "240px",
          minHeight: "fit-content",
          backgroundColor: "white",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "8px",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
          padding: "13px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            paddingBottom: "0.5em",
            cursor: "grab",
            width: "100%",
          }}
          onMouseDown={handleMouseDown}
        >
          <span
            style={{
              wordBreak: "break-word",
              fontSize: "0.8em",
              color: "#222",
            }}
          >
            {selectedImage.filename}
            {selectedImage.author &&  <span style={{fontStyle: 'italic', fontWeight: '300'}}> by {selectedImage.author}</span>}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
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
        <div className="keyword-container">
          <h3 className="keyword-title">Why do you like this image?</h3>
          <p className="keyword-subtitle">Choose keywords that you like.</p>
        </div>

        <div className="image-container">
          {Object.entries(groupedKeywords)
            .filter(([type]) => type !== "Arrangement") // Exclude "Arrangement" here
            .map(([type, keywords]) => (
              <div key={type} className="keyword-group">
                <KeywordButton
                  className="keyword-button"
                  fontSize="0.8607em"
                  text={`I like the ${type} of this image`}
                  type={type}
                  isSelected={!!likedElementTypes[type]}
                  onClick={() => toggleLikedElementType(type)}
                />
                {likedElementTypes[type] && (
                  <div
                    className="keyword-list scrollable-container"
                    style={{ maxHeight: "5.5em" }}
                  >
                    {keywords.map((keyword) => (
                      <KeywordButton
                        key={keyword._id}
                        ref={(el) => {
                          if (el) keywordRefs.current[keyword._id] = el;
                        }}
                        text={keyword.keyword}
                        type={keyword.type}
                        isCustom={keyword.isCustom}
                        isSelected={!!(keyword.offsetX || keyword.offsetY)}
                        onClick={() => toggleOnBoard(keyword)}
                        onDelete={() => deleteCustom(keyword)}
                      />
                    ))}
                    <KeywordInput
                      boardId={selectedImage.boardId}
                      imageId={selectedImage._id}
                      type={type}
                      addKeywordSelection={addKeywordSelection}
                    />
                  </div>
                )}
              </div>
            ))}
          {groupedKeywords["Arrangement"] && (
            <div key={"Arrangement"} className="keyword-group">
              <KeywordButton
                className="keyword-button"
                text={`I like the Arrangement of this image`}
                type={"Arrangement"}
                fontSize="0.8607em"
                isSelected={
                  groupedKeywords["Arrangement"][0].offsetX !== undefined &&
                  groupedKeywords["Arrangement"][0].offsetY !== undefined
                }
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikedElementType("Arrangement");
                  toggleOnBoard(groupedKeywords["Arrangement"][0]);
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default KeywordSelection;
