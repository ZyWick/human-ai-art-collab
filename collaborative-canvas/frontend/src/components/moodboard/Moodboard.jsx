import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Text } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import useWindowSize from "../../hook/useWindowSize";
import ImageComponent from "./ImageComponent";
import KeywordComponent from "./KeywordComponent";
import ThreadInput from "../widgets/ThreadInput";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById } from "../../redux/boardsSlice";
import ThreadBubble from "./ThreadBubble";
import FeedbackPopup from "./FeedbackPopup";

const Moodboard = () => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();
  const images = useSelector((state) => state.images);
  const noteKeywords = useSelector((state) => state.room.boardNoteKeywords);
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const [inputData, setInputData] = useState(null);
  const { user } = useAuth();
  const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const socket = useSocket();
  const boardThreads = useSelector((state) => state.room.boardThreads);
  const tooltipRef = useRef(null);
  const [tooltipData, setTooltipData] = useState({
    position: { x: 0, y: 0 },
    data: null,
  });
  const [popupData, setPopupData] = useState(null); // Click popup

  const handleElementClick = (event, id) => {
    event.cancelBubble = true; // Prevent stage click from triggering
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    const maxX = window.innerWidth - 240 - 10;
    const minY = 40;

    setInputData({
      userId: user.id,
      username: user.username,
      position: {
        x: Math.min(pointer.x, maxX),
        y: Math.max(pointer.y, minY),
      },
      imageId: id.imageId,
      keywordId: id.keywordId,
      value: "",
    });
  };

  const handleStageClick = (event) => {
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();

    setInputData({
      userId: user.id,
      username: user.username,
      position: {
        x: pointer.x,
        y: pointer.y,
      },
      boardId: currentBoardId,
      value: "",
    });
  };

  const handleSubmit = () => {
    if (inputData?.value.trim()) {
      socket.emit("createThread", inputData);
    }
    setInputData(null);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const scaleBy = 1.05; // Zoom sensitivity
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Adjust scale based on wheel direction
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });

    // Keep the zoom centered around the mouse pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw(); // Optimize drawing performance
  };

  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  const calculateTooltipPosition = (event, data) => {
    if (!data) return { x: 0, y: 0 };
    const rect = event.target.getClientRect();

    return {
      x: rect.x + rect.width * 0.75,
      y: rect.y - rect.height * 0.65,
    };
  };

  const handleThreadHover = (event, data) => {
    const position = calculateTooltipPosition(event, data);

    setTooltipData({
      position,
      data,
    });
  };

  useEffect(() => {
    if (!tooltipRef.current || !tooltipData) return;

    const { width, height } = tooltipRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - width - 10;
    const maxY = 40;

    setAdjustedPosition((prev) => {
      const newX = Math.min(tooltipData.position.x, maxX);
      const newY = Math.max(tooltipData.position.y, maxY);

      return prev.x !== newX || prev.y !== newY ? { x: newX, y: newY } : prev;
    });
  }, [tooltipData]);

  const handleThreadClick = (event, data, element) => {
    event.cancelBubble = true
    const rect = event.target.getClientRect();
    let x = rect.x;
    let y = rect.y + rect.height + 8; // Below the clicked element

    setPopupData({
      position: { x: x, y: y },
      data,
      [element.type]: element._id,
    });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div style={{ cursor: isAddingComments ? "text" : "default" }}>
      <Stage
        width={windowSize.width}
        height={windowSize.height}
        ref={stageRef}
        onWheel={handleWheel} // Enable zooming with mouse wheel
        onClick={handleStageClick}
        // onDragMove={e => handleDragMove(e)}
        draggable // Optional: Allow panning
      >
        <Layer>
          {images &&
            images.map((img) => (
              <ImageComponent
                key={img._id}
                imgData={img}
                stageRef={stageRef}
                handleElementClick={handleElementClick}
                setTooltipData={setTooltipData}
                handleThreadClick={handleThreadClick}
                handleThreadHover={handleThreadHover}
              />
            ))}
          {noteKeywords &&
            noteKeywords.map((kw) => (
              <KeywordComponent
                key={kw._id}
                data={kw}
                imageBounds={{ x: 0, y: 0 }}
                handleElementClick={handleElementClick}
                setTooltipData={setTooltipData}
                handleThreadClick={handleThreadClick}
                handleThreadHover={handleThreadHover}
              />
            ))}
          {boardThreads &&
            boardThreads.map((thread) => (
              <ThreadBubble
                key={thread._id}
                thread={thread}
                position={thread.position}
                onMouseEnter={(event) => handleThreadHover(event, thread)}
                onMouseLeave={() => setTooltipData(null)}
                onClick={(event) =>
                  handleThreadClick(event, thread, {
                    type: "boardId",
                    _id: currentBoardId,
                  })
                }
              />
            ))}
        </Layer>
      </Stage>
      {inputData && (
        <ThreadInput
          position={inputData.position}
          value={inputData.value}
          onChange={(value) => setInputData((prev) => ({ ...prev, value }))}
          onSubmit={handleSubmit}
          onCancel={() => setInputData(null)}
        />
      )}

      {tooltipData?.data && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            padding: "6px 10px",
            margin: "0",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            zIndex: 100,
            maxWidth: "250px",
            wordWrap: "break-word",
            lineHeight: "1.3", // Reduced line spacing
            parginTop: "0px",
          }}
        >
          {/* Username & Date */}
          <p
            style={{
              margin: "0",
              fontSize: "13px",
              color: "#333",
              fontWeight: "bold",
              marginBottom: "2px",
            }}
          >
            {tooltipData.data?.username || "Unknown"}
            <span
              style={{ marginLeft: "4px", fontSize: "12px", color: "#777" }}
            >
              {timeAgo(tooltipData.data?.createdAt)}
            </span>
          </p>

          {/* Value */}
          <p style={{ fontSize: "13px", color: "#555", margin: "6px 0" }}>
            {tooltipData.data?.value}
          </p>

          {/* Number of children */}
          <p style={{ fontSize: "12px", color: "#777", margin: "2px 0 0" }}>
            {tooltipData.data?.children?.length || 0} replies
          </p>
        </div>
      )}

      {/* Popup on Click */}
      {popupData && (
        <FeedbackPopup
          popupData={popupData}
          onClose={() => setPopupData(null)}
          onReply={() => {}}
        />
      )}
    </div>
  );
};

export default Moodboard;
