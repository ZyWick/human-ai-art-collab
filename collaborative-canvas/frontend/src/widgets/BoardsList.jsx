import { useState } from "react";

const BoardsList = ({ board, loadBoard, deleteBoard }) => {
  const [hovered, setHovered] = useState(false);


  return (
    <div
      onClick={() => loadBoard(board._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "3.5%",
        width: "100%",
        cursor: "pointer"
      }}
    >
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering loadBoard
            deleteBoard(board._id, board.roomId);
          }}
          style={{
            position: "absolute",
            top: "0.45em",
            right: "0.85em",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      )}

      {board.generatedImages?.length ? (
        <img
          style={{
            width: "95%",
            objectFit: "contain",
            maxHeight: "15vh",
            marginBottom: "1%",
            marginTop: "0",
          }}
          className="image-preview"
          alt=""
          src={board.generatedImages[0]}
        />
      ) : (
        <div
          style={{
            width: "95%",
            height: "15vh",
            background: "rgba(169, 169, 169, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        />
      )}
      {board.name}
    </div>
  );
};

export default BoardsList;
