import React, { useEffect, useState, useRef } from "react";
import { KeywordButton, KeywordInput } from "./KeywordButton";
import { calculateNewKeywordPosition } from "../util/keywordMovement";
import { useSelector } from "react-redux";
import { useSocket } from "../components/SocketContext";
import { selectImageById } from "../redux/imagesSlice";
import "../styles/keywordSelection.css";
import { deleteKeyword } from "../util/api";

const KeywordSelection = ({ selectedImageId }) => {
  const keywordRefs = useRef({});
  const socket = useSocket();
  
  const selectedImage = useSelector(state => selectImageById(state, selectedImageId));
  
  const [likedElementTypes, setLikedElementTypes] = useState({});
  const [groupedKeywords, setGroupedKeywords] = useState({});

  useEffect(() => {
    if (selectedImage?.keywords) {
      const grouped = selectedImage.keywords.reduce((acc, keyword) => {
        acc[keyword.type] = acc[keyword.type] || [];
        acc[keyword.type].push(keyword);
        return acc;
      }, {});
      setGroupedKeywords(grouped);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedImage) return;
  
    setLikedElementTypes((prev) => {
      const updatedLikes = { ...prev };
  
      selectedImage.keywords.forEach((keyword) => {
        if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
          updatedLikes[keyword.type] = true;
        }
      });
  
      return updatedLikes;
    });
  }, [selectedImage]);

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
    if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
      socket.emit("removeKeywordOffset", keyword._id);
    } else {
      const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
      const { x, y } = getRandomPoint(selectedImage.width, selectedImage.height);
      const { newX, newY } = calculateNewKeywordPosition(x, y, bbox.width, bbox.height, selectedImage.width, selectedImage.height);
      newKeyword = { ...keyword, offsetX: newX, offsetY: newY };
      socket.emit("updateKeyword", newKeyword);
    }
    setGroupedKeywords(prev => ({
      ...prev,
      [newKeyword.type]: prev[newKeyword.type].map(kw => kw._id === newKeyword._id ? newKeyword : kw)
    }));
    socket.emit("updateImage", { ...selectedImage, keywords: selectedImage.keywords.map(kw => kw._id === newKeyword._id ? newKeyword : kw) });
  };

  const deleteCustom = async keyword => {
    await deleteKeyword(keyword._id);
    const updatedKeywords = selectedImage.keywords.filter(kw => kw._id !== keyword._id);
    socket.emit("updateImage", { ...selectedImage, keywords: updatedKeywords });
  };

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: selectedImage.boardId, imageId: selectedImage._id, isCustom: true, type, keyword: newKeywordText };
    socket.emit("newKeyword", { newKeyword, selectedImage });
  };

  return (
    <>
      <img className="image-preview" alt="" src={selectedImage?.url} />
      <hr className="divider" />
      
      <div className="keyword-container">
        <h3 className="keyword-title">Why do you like this image?</h3>
        <p className="keyword-subtitle">Choose keywords that you like.</p>
      </div>
      
      <div className="image-container">
          {Object.entries(groupedKeywords).map(([type, keywords]) => (
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
                  {keywords.map(keyword => (
                    <KeywordButton
                      key={keyword._id}
                      ref={el => { if (el) keywordRefs.current[keyword._id] = el; }}
                      text={keyword.keyword}
                      type={keyword.type}
                      isCustom={keyword.isCustom}
                      isSelected={!!(keyword.offsetX || keyword.offsetY)}
                      onClick={() => toggleOnBoard(keyword)}
                      onDelete={() => deleteCustom(keyword)}
                    />
                  ))}
                  <KeywordInput boardId={selectedImage.boardId} imageId={selectedImage._id} type={type} addKeywordSelection={addKeywordSelection} />
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default KeywordSelection;