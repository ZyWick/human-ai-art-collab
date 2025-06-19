import React, { useState, useEffect, useRef } from "react";
import Konva from "konva";
import DesignDetails from "../widgets/DesignDetails";
import UploadButton from "../widgets/UploadButton";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { selectBoardById } from "../../redux/boardsSlice";
import IterationsPopup from "../widgets/IterationsPopup";
import "../../assets/styles/toolbar.css";
import NoteKeywordInput from "../widgets/NoteKeywordInput";

const DesignWorkspace = ({ stageRef }) => {
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [topBottom, setTopBottom] = useState(0);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const topRef = useRef(null);
  const secondRef = useRef(null);

  const socket = useSocket();

  const [showAllIterations, setShowAllIterations] = useState(false);

  const boardId = useSelector((state) => state.room.currentBoardId);
  const currBoard = useSelector((state) => selectBoardById(state, boardId));

  const handleBackToOrigin = () => {
    const stage = stageRef.current;
    stage.to({
      x: 0,
      y: 0,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });
  };

  useEffect(() => {
    const element = topRef.current;
    if (!element) return; 

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


  return (
    <>
      <div
        ref={topRef}
        style={{
          position: "absolute",
          width: "220px",
          maxHeight: "55vh",
          left: "2.5%",
          top: "12.5%",
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
              gridTemplateRows: "1fr",
            }}
          >
            <div
              style={{
                display: "grid",
                height: "2em",
                gridTemplateColumns: "50% 50%",
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
          <NoteKeywordInput />
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
