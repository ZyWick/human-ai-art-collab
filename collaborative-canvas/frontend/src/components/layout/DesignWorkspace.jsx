import React, { useState, useEffect, useRef, useCallback } from "react";
import Konva from "konva";
import DesignDetails from "../widgets/DesignDetails";
import UploadButton from "../widgets/UploadButton";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById, updateBoard } from "../../redux/boardsSlice";
import { clearAllVotes } from "../../redux/keywordsSlice";
import { setIsAddingComments } from "../../redux/roomSlice";
import IterationsPopup from "../widgets/IterationsPopup";
import "../../assets/styles/toolbar.css";
import { NoteKeywordInput } from "../widgets/KeywordButton";

const DesignWorkspace = ({ stageRef }) => {
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [topBottom, setTopBottom] = useState(0);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const topRef = useRef(null);
  const secondRef = useRef(null);
  const designDetails = useSelector((state) => state.room.designDetails);
  const isDesignDetailsEmpty = Object.entries(designDetails)
    .filter(([key]) => key !== "others")
    .some(([, value]) => !value?.trim());
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();

  const [showAllIterations, setShowAllIterations] = useState(false);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));
  const isVoting = currBoard?.isVoting;

  const handleBackToOrigin = () => {
    const stage = stageRef.current;
    stage.to({
      x: 0,
      y: 0,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });
  };

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = {
      boardId: boardId,
      type,
      keyword: newKeywordText,
      offsetX: window.innerWidth * (0.5 + Math.random() * 0.5),
      offsetY: window.innerHeight * (0.5 + Math.random() * 0.5),
    };
    socket.emit("newKeyword", newKeyword);
  };

  useEffect(() => {
    const element = topRef.current;
    if (!element) return; // Ensure it's defined

    const updatePosition = () => {
      if (topRef.current) {
        const rect = topRef.current.getBoundingClientRect();
        setTopBottom(rect.bottom);
      }
    };

    updatePosition();

    const observer = new ResizeObserver(() => {
      if (topRef.current) updatePosition();
    });

    observer.observe(element);
    window.addEventListener("resize", updatePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const handleResetVotes = useCallback(() => {
    dispatch(clearAllVotes, {});
    socket.emit("clearKeywordVotes", boardId);
  }, [dispatch, socket, boardId]);

  const handleToggleVoting = useCallback(() => {
    dispatch(updateBoard, { id: boardId, changes: { isVoting: !isVoting } });
    socket.emit("toggleVoting", boardId);
  }, [dispatch, socket, boardId, isVoting]);

  const handleToggleComments = useCallback(() => {
    dispatch(setIsAddingComments, !isAddingComments);
  }, [dispatch, isAddingComments]);

  const handleToggleIterations = useCallback(() => {
    setShowAllIterations((prev) => !prev);
  }, []);

  return (
    <>
      <div
        ref={topRef}
        style={{
          position: "absolute",
          width: "220px",
          maxHeight: "55vh",
          left: "2.5%",
          top: "15%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
          padding: "13px",
          display: "flex",
          zIndex: "100",
        }}
      >
        <DesignDetails />
      </div>

      {topBottom > 0 && (
        <div
          ref={secondRef}
          style={{
            width: "220px",
            maxHeight: "20vh",
            position: "absolute",
            left: "2.5%",
            top: `${topBottom + 20}px`, // 10px spacing below first box
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
            padding: "13px",
            display: "flex",
            flexDirection: "column",
            zIndex: 99,
          }}
        >
          <UploadButton
            stageRef={stageRef}
            isUploadingImg={isUploadingImg}
            setIsUploadingImg={setIsUploadingImg}
            isDesignDetailsEmpty={isDesignDetailsEmpty}
          />

          <div
            style={{
              height: "0.1px",
              width: "100%",
              backgroundColor: "#ccc",
            }}
          />
          <div
            style={{
              height: "85%",
              width: "100%",
              display: "grid",
              marginTop: "0.75em",
              gridTemplateRows: "1fr 1fr",
            }}
          >
            <div
              style={{
                display: "grid",
                height: "2em",
                gridTemplateColumns: "33.33% 33.33% 33.33%",
              }}
            >
              <div
                onClick={handleBackToOrigin}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  title="Back to Origin"
                  style={{ height: "100%", width: "100%" }}
                  className="custom-button"
                >
                  <img
                    src="/icons/crosshair.svg"
                    alt="Back to Origin"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleToggleComments}
                  title="Add Comment"
                  className={
                    isAddingComments ? "active custom-button" : "custom-button"
                  }
                  style={{ height: "100%", width: "100%" }}
                >
                  <img
                    src="/icons/chat.svg"
                    alt="Add Comment"
                    width="20"
                    height="17.5"
                  />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleToggleIterations}
                  title={
                    showAllIterations ? "Hide Iterations" : "Show Iterations"
                  }
                  className={
                    showAllIterations ? "active custom-button" : "custom-button"
                  }
                  style={{ height: "100%", width: "100%" }}
                >
                  <img
                    src="/icons/folder.svg"
                    alt="Show iterations"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "33.33% 33.33% 33.33%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {" "}
                <button
                  style={{ height: "100%", width: "100%" }}
                  onClick={handleToggleVoting}
                  title="Vote"
                  className={
                    isVoting ? "active custom-button" : "custom-button"
                  }
                >
                  <img
                    src="/icons/vote.svg"
                    alt="Toggle Voting"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  className="custom-button"
                  style={{ height: "100%", width: "100%" }}
                  onClick={handleResetVotes}
                  title="Reset Votes"
                >
                  <img
                    src="/icons/reset.svg"
                    alt="Reset votes"
                    width="14"
                    height="14"
                  />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  className={
                    isAddingNotes ? "active custom-button" : "custom-button"
                  }
                  style={{ height: "100%", width: "100%" }}
                  onClick={() => setIsAddingNotes(!isAddingNotes)}
                  title="Add Notes"
                >
                  <img
                    src="/icons/note-svgrepo-com.svg"
                    alt="Add Notes"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingNotes && (
        <div
          style={{
            width: "fit-content",
            maxHeight: "20vh",
            position: "absolute",
            left: "calc(2.5% + 220px + 40px)",
            top: `${topBottom + 20}px`, // 10px spacing below first box
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.125)",
            padding: "13px",
            zIndex: 99,
          }}
        >
          <NoteKeywordInput addKeywordSelection={addKeywordSelection} />
        </div>
      )}
      {showAllIterations && (
        <IterationsPopup
          currBoard={currBoard}
          setShowAllIterations={setShowAllIterations}
        />
      )}
    </>
  );
};

export default DesignWorkspace;
