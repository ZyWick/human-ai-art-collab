import React, { useState } from "react";
import MergePanel from "../widgets/MergePanel";
import BoardsPanel from "../widgets/BoardsPanel"

const panels = {
  Merge: <MergePanel />,
  Boards: <BoardsPanel />,
};

const OutputHub = () => {
  const [activePanel, setActivePanel] = useState("Merge");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh" /* Ensures full viewport height */,
      }}
    >
       <nav style={{ display: "flex", gap: "1rem", padding: "0.55em", paddingBottom: "1.25em" }}>
        {Object.keys(panels).map((key) => (
          <button
            key={key}
            onClick={() => setActivePanel(key)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1rem",
              fontWeight: activePanel === key ? "bold" : "normal",
              borderBottom: activePanel === key ? "0.5px solid black" : "none",
              cursor: "pointer",
              paddingBottom: "0.45em",
            }}
          >
            {key}
          </button>
        ))}
      </nav>

      {/* Dynamic Panel Rendering */}
      {panels[activePanel]}
    </div>
  );
};

export default OutputHub;
