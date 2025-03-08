import React, { useEffect, useState, useRef } from "react";
import {KeywordButton , KeywordInput} from "./KeywordButton";
import { calculateNewKeywordPosition } from "../util/keywordMovement";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../components/SocketContext";
import { updateImage } from "../redux/imagesSlice";
import { selectImageById  } from '../redux/imagesSlice'
import '../styles/keywordSelection.css'

const KeywordSelection = ({selectedImageId}) => {
  const keywordRefs = useRef({});
  const socket = useSocket();
  const dispatch = useDispatch();
  const [likedElementTypes, setLikedElementTypes] = useState({
    "Subject matter": false,
    "Theme & mood": false,
    "Action & pose": false,
    Arrangement: false,
  });

  const selectedImage = useSelector(state => selectImageById(state, selectedImageId));
  // Group keywords by type
  const initialGroupedKeywords = selectedImage.keywords?.reduce((acc, keyword) => {
    if (!acc[keyword.type]) {
      acc[keyword.type] = [];
    }
    acc[keyword.type].push(keyword);
    return acc;
  }, {});
  
  const [groupedKeywords, setGroupedKeywords] = useState(initialGroupedKeywords);

  const toggleLikedElementType = (type) => {
    setLikedElementTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const toggleOnBoard = (keyword) => {
    let { offsetX, offsetY, ...newKeyword } = keyword;
    console.log(offsetX!== undefined)
    if (offsetX !== undefined && offsetY !== undefined) {
      console.log("hello")
      socket.emit("removeKeywordOffset", keyword._id);
    } else {
      const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
      const newOffset = calculateNewKeywordPosition(
        Math.random() * bbox.width,
        Math.random() * bbox.height,
        bbox.width,
        bbox.height,
        selectedImage.width,
        selectedImage.height
      );
      console.log("what")
      newKeyword = {
        ...keyword,
        offsetX: newOffset.newX,
        offsetY: newOffset.newY,
      };
      console.log(newKeyword)
      socket.emit("updateKeyword", newKeyword);
    }

    setGroupedKeywords(prevGroupedKeywords => ({
      ...prevGroupedKeywords,
      [newKeyword.type]: prevGroupedKeywords[newKeyword.type].map(kw =>
        kw._id === newKeyword._id
          ? {
              ...kw, // Use kw, not keyword
              offsetX: newKeyword.offsetX,
              offsetY: newKeyword.offsetY,
            }
          : kw
      )
    }));

    const updatedImage = {...selectedImage,
      keywords: selectedImage.keywords.map((keyword) =>
        keyword._id === newKeyword._id ? newKeyword : keyword)
    }

    socket.emit("updateImage", updatedImage)
  };

  const addKeywordSelection = (type, newKeywordText) => {
    const newKeyword = { boardId: selectedImage.boardId, imageId: selectedImage._id, 
      isSelected: false, type, keyword: newKeywordText }
    socket.emit("newKeyword", {newKeyword, selectedImage})
  }

  useEffect(() => {
    setGroupedKeywords (selectedImage.keywords?.reduce((acc, keyword) => {
      if (!acc[keyword.type]) {
        acc[keyword.type] = [];
      }
      acc[keyword.type].push(keyword);
      return acc;
    }, {}))
  }, [selectedImage])

  // Update likedElementTypes when selectedImage changes
  useEffect(() => {
    if (!selectedImage) return;
    const updatedLikes = {
      "Subject matter": false,
      "Theme & mood": false,
      "Action & pose": false,
      Arrangement: false,
    };
    selectedImage.keywords.forEach((keyword) => {
      if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
        updatedLikes[keyword.type] = true;
      }
    });

    setLikedElementTypes(updatedLikes);
  }, [selectedImage]);
  return (
    <>
      <img
        alt=""
        style={{ width:"95%", objectFit: "contain", maxHeight: "27.5vh", marginTop: "7%" }}
        src={selectedImage.url}
      />
      <hr
        style={{
          border: "none",
          height: "0.05em",
          backgroundColor: "darkgrey",
          width: "100%",
          margin: "1.25em",
        }}
      />
      <div style={{ width: "90%", height: "41.5%"}}>
        <h3 style={{ marginBlock: "0", fontSize: "1.25em", textAlign: "left" }}>
          Why do you like this image?
        </h3>
        <p style={{ color: "grey", margin: "0", marginBottom: "1.15em" }}>
          Choose keywords that you like.
        </p>
        <div id={"container1"}><div id={"container2"}>
        {Object.entries(groupedKeywords).map(([type, keywords]) => (
          <div key={type} style={{ marginBottom: "0.4em" }}>
            <KeywordButton
              style={{ width: "100%" }}
              text={`I like the ${type} of this image`}
              type={type}
              isSelected={likedElementTypes[type]}
              onClick={() => toggleLikedElementType(type)}
            />
            {likedElementTypes[type] && (
              <div 
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  marginLeft: "0.75em",
                  marginTop: "0.3em",
                  marginBottom: "0.6em",
                  flexWrap: "wrap",
                  overflowX: "auto",
                  justifyContent: "flex-start",
                  gap: "0.2em",
                }}
              >
                {keywords.map((keyword) => (
                  <KeywordButton
                    key={keyword._id}
                    ref={(el) => {
                      if (el) keywordRefs.current[keyword._id] = el;
                    }}
                    text={keyword.keyword}
                    type={keyword.type}
                    isSelected={!!(keyword.offsetX || keyword.offsetY)}
                    onClick={() => toggleOnBoard(keyword)}
                  />
                ))}
                <KeywordInput boardId={selectedImage.boardId} imageId={selectedImage._id} 
                type={type} addKeywordSelection={addKeywordSelection}/>
              </div>
            )}
          </div>
        ))}
        </div></div>
      </div>
    </>
  );
};

export default KeywordSelection;
