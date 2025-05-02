import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { useSocket } from '../../context/SocketContext';
import { KeywordButton, KeywordInput } from "./KeywordButton";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import "../../assets/styles/keywordSelection.css";
import { selectKeywordsByImage, updateKeyword } from "../../redux/keywordsSlice";
import { removeSelectedKeyword } from "../../redux/selectionSlice";


const KeywordSelection = ({selectedImage}) => {
  const keywordRefs = useRef({});
  const socket = useSocket();
  const dispatch = useDispatchWithMeta();

  const [likedElementTypes, setLikedElementTypes] = useState({});
  // const [groupedKeywords, setGroupedKeywords] = useState({});
  const imageKeywords = useSelector((state) => selectKeywordsByImage(state, selectedImage));
  
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

  // useEffect(() => {
  //   console.log("Updated imageKeywords:", imageKeywords);
  // }, [imageKeywords]);
  

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
    const radius = Math.random() * Math.max(w, h);
    return { x: w / 2 + radius * Math.cos(angle), y: h / 2 + radius * Math.sin(angle) };
  };

  const toggleOnBoard = (keyword) => {
    if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
      dispatch(removeSelectedKeyword, keyword._id); 
      dispatch(updateKeyword, {
        id: keyword._id,
        changes: {
          offsetX: undefined,
          offsetY: undefined,
          isSelected: false,
        },
      });
      socket.emit("removeKeywordFromBoard", keyword._id);
      return;
    }

    const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
    const { x, y } = getRandomPoint(selectedImage.width, selectedImage.height);
    const { offsetX, offsetY } = calculateNewKeywordPosition(
      x, y, bbox?.width || 50, bbox?.height || 20, 
      selectedImage.width, selectedImage.height
    );

    const update = { id: keyword._id, changes: { offsetX, offsetY } };
    dispatch(updateKeyword, update);
    socket.emit("updateKeywordOffset", update);
  };

  const deleteCustom = (keyword) => {
    socket.emit("deleteKeyword", { imageId: selectedImage._id, keywordId: keyword._id });
  };

  const addKeywordSelection = (type, newKeywordText) => {
    socket.emit("newKeyword", { 
      boardId: selectedImage.boardId, 
      imageId: selectedImage._id, 
      isCustom: true, 
      type, 
      keyword: newKeywordText 
    });
  };

  return (
    <>
      
      <img className="image-preview-selection" alt="" src={selectedImage?.url} />
      <div className="shadow-container" 
      style={{height: "100%", marginTop: "1em", paddingTop: "1em",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
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
      </div>
    </>
  );
};


export default KeywordSelection;