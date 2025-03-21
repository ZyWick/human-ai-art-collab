import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAllBoards } from "../../redux/boardsSlice";
import "../../assets/styles/BoardsList.css";
import { KeywordButton } from "./KeywordButton";

const DisplayAllBoardImages = ({currBoard}) => {
  
  return (
    <div className="all-boards-container">
      {currBoard?.iterations?.slice().reverse().map((iter) => (
        <div key={iter._id} className="board-row">
          {/* <h3 className="board-title">{board.name}</h3> */}
          <div style={{backgroundColor: "#F5F5F5", width: "100%", display: "flex"}}>
          <div className="image-container-all">
            {iter.generatedImages.map((image, index) => (
              <img key={index} className="row-image" alt="" src={image} />
            ))}
          </div></div>
          <div style={{display: "flex", flexWrap: "wrap", gap:"0.5em"}}>
         {iter.keywords && iter.keywords.length > 0 && 
          iter.keywords.map((keyword) => (
            <KeywordButton
              key={keyword._id}
              text={keyword.keyword}
              type={keyword.type}
              isSelected={true}
            />
          ))}</div>
        </div>
      ))}
    </div>
  );
};

export default DisplayAllBoardImages;
