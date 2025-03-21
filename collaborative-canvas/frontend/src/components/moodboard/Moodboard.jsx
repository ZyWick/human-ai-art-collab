import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { selectAllKeywords } from "../../redux/keywordsSlice";
import { selectBoardById } from "../../redux/boardsSlice";
import { selectBoardThreads } from "../../redux/threadsSlice";

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
  const tooltipRef = useRef(null);
  const windowSize = useWindowSize();
  const socket = useSocket();
  const { user } = useAuth();

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

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const scaleBy = 1.05;
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
    });
    stage.batchDraw();
  }, []);

  useEffect(() => {
    if (!tooltipRef.current || !tooltipData) return;
    const { width } = tooltipRef.current.getBoundingClientRect();
    setAdjustedPosition({
      x: Math.min(tooltipData.position.x, window.innerWidth - width - 10),
      y: Math.max(tooltipData.position.y, 40),
    });
  }, [tooltipData]); // Runs after tooltipData updates and ensures tooltipRef is valid

  const handleThreadHover = useCallback(
    (event, data) => {
      if (!data) return;
      const rect = event.target.getClientRect();
      setTooltipData({
        position: {
          x: rect.x + rect.width * 0.75,
          y: rect.y - rect.height * 0.65,
        },
        data,
      });
    },
    [setTooltipData]
  );

  const handleThreadClick = useCallback((event, threadId) => {
    event.cancelBubble = true;
    const rect = event.target.getClientRect();
    setPopupData({
      position: { x: rect.x, y: rect.y + rect.height + 8 },
      threadId,
    });
  }, []);

  return (
    <div style={{ cursor: isAddingComments ? "text" : "default" }}>
      <Stage
        width={windowSize.width}
        height={windowSize.height}
        ref={stageRef}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable
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
          {keywords &&
            keywords.map((kw) => (
              <KeywordComponent
                key={kw._id}
                data={kw}
                stageRef={stageRef}
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
                onClick={(event) => handleThreadClick(event, thread._id)}
              />
            ))}
        </Layer>
      </Stage>

      {isAddingComments && inputData && (
        <ThreadInput
          position={inputData.pointerPosition}
          value={inputData.value}
          onChange={(value) => setInputData((prev) => ({ ...prev, value }))}
          onSubmit={handleSubmit}
          onCancel={() => setInputData(null)}
        />
      )}

      {tooltipData && (
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
            zIndex: 5,
            maxWidth: "250px",
            wordWrap: "break-word",
            lineHeight: "1.3", // Reduced line spacing
            parginTop: "0px",
          }}
        >
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
          <p style={{ fontSize: "13px", color: "#555", margin: "6px 0" }}>
            {tooltipData.data?.value}
          </p>
          <p style={{ fontSize: "12px", color: "#777", margin: "2px 0 0" }}>
            {tooltipData.data?.childrenCount || 0} replies
          </p>
        </div>
      )}

      {popupData && (
        <FeedbackPopup
          popupData={popupData}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
};

export default Moodboard;
