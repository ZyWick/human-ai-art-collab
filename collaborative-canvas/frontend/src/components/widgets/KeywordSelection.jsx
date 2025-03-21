import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from '../../context/SocketContext';
import { KeywordButton, KeywordInput } from "./KeywordButton";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import "../../assets/styles/keywordSelection.css";
import { selectKeywordsByImage } from "../../redux/keywordsSlice";
import { updateKeyword } from "../../redux/keywordsSlice";

const KeywordSelection = ({selectedImage}) => {
  const keywordRefs = useRef({});
  const socket = useSocket();
  const dispatch =useDispatch();
   const [likedElementTypes, setLikedElementTypes] = useState({});
  const [groupedKeywords, setGroupedKeywords] = useState({});
  const imageKeywords = useSelector((state) => selectKeywordsByImage(state, selectedImage));

  useEffect(() => {
    const requiredTypes = ["Action & pose", "Subject matter", "Theme & mood"];
    if (imageKeywords) {
      const grouped = imageKeywords.reduce((acc, keyword) => {
        acc[keyword.type] = acc[keyword.type] || [];
        acc[keyword.type].push(keyword);
        return acc;
      }, {});
      requiredTypes.forEach((type) => {
        if (!grouped[type]) {
          grouped[type] = [];
        }
      });

      setGroupedKeywords(grouped);
    }
  }, [imageKeywords]);

  useEffect(() => {
    if (!imageKeywords) return;
  
    setLikedElementTypes((prev) => {
      const updatedLikes = { ...prev };
  
      imageKeywords.forEach((keyword) => {
        if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
          updatedLikes[keyword.type] = true;
        }
      });
  
      return updatedLikes;
    });
  }, [imageKeywords]);

  const toggleLikedElementType = type => {
    setLikedElementTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const getRandomPoint = (w, h) => {
    const angle = Math.random() * 2 * Math.PI;
    const max = Math.max(w, h);
    const radius = Math.random() * (max - Math.max(w, h)) + Math.max(w, h);
    return { x: w / 2 + radius * Math.cos(angle), y: h / 2 + radius * Math.sin(angle) };
  };

  const toggleOnBoard = keyword => {
    let newKeyword = { ...keyword };
    if ((keyword.offsetX !== undefined && keyword.offsetY !== undefined)) {
      socket.emit("removeKeywordFromBoard", keyword._id);
    } else {
      const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
      const { x, y } = getRandomPoint(selectedImage.width, selectedImage.height);
      const { offsetX, offsetY } = calculateNewKeywordPosition(x, y, bbox.width, bbox.height, selectedImage.width, selectedImage.height);
      const update = { id: newKeyword._id, changes: { offsetX: offsetX, offsetY: offsetY } }
      dispatch(updateKeyword(update));
      socket.emit("updateKeywordOffset", update);
    }
    setGroupedKeywords(prev => ({
      ...prev,
      [newKeyword.type]: prev[newKeyword.type].map(kw => kw._id === newKeyword._id ? newKeyword : kw)
    }));
  };

  const deleteCustom = async keyword => {
    socket.emit("deleteKeyword", {imageId: selectedImage._id, keywordId: keyword._id});
  };

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: selectedImage.boardId, imageId: selectedImage._id, isCustom: true, type, keyword: newKeywordText };
    socket.emit("newKeyword", newKeyword);
  };
  return (
    <>
      
      <img className="image-preview-selection" alt="" src={selectedImage?.url} />
      <hr className="divider" />
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
          text={`I like the ${type} of this image`}
          type={type}
          isSelected={likedElementTypes[type]}
          onClick={() => toggleLikedElementType(type)}
        />
        {likedElementTypes[type] && (
          <div className="keyword-list">
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
    {groupedKeywords["Arrangement"] &&
           <div key={"Arrangement"} className="keyword-group">
              <KeywordButton
                className="keyword-button"
                text={`I like the Arrangement of this image`}
                type={"Arrangement"}
                isSelected={(groupedKeywords["Arrangement"][0].offsetX !== undefined && groupedKeywords["Arrangement"][0].offsetY !== undefined)}
                onClick={(e) => {e.stopPropagation();
                  toggleLikedElementType("Arrangement")
                  toggleOnBoard(groupedKeywords["Arrangement"][0])
                }}
              />
              <div className="keyword-list" style={{visibility: "hidden" }}>
               <KeywordButton
                key={groupedKeywords["Arrangement"][0]?._id}
                text={"Arrangement"}
                type={"Arrangement"}
                ref={(el) => {
                  if (el) keywordRefs.current[groupedKeywords["Arrangement"][0]?._id] = el;
                }}
              /></div>
              </div>}
      </div>
      <hr
          style={{
            marginTop: "8px",
            marginBottom: "0",
            border: "none",
            minHeight: "0.05em",
            backgroundColor: "darkgrey",
            width: "100%",
          }}
        />
    </>
  );
};


export default KeywordSelection;