import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAllBoards } from "../../redux/boardsSlice";
import "../../assets/styles/BoardsList.css";

const DisplayAllBoardImages = () => {
  const boardData = useSelector(selectAllBoards);

  const sortedBoards = useMemo(() => {
    return [...boardData].sort((a, b) => {
      if (a.isStarred !== b.isStarred) return b.isStarred - a.isStarred;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [boardData]);

  return (
    <div className="all-boards-container">
      {sortedBoards.map((board) => (
        <div key={board.id} className="board-row">
          <h3 className="board-title">{board.name}</h3>
          <div className="image-container-all">
            {board.generatedImages.map((image, index) => (
              <img key={index} className="image-preview row-image" alt="" src={image} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayAllBoardImages;
