import React, { useEffect, useState, useRef } from "react";
import KeywordButton from "./KeywordButton";
import { calculateNewKeywordPosition } from "../util/keywordMovement";

const KeywordSelection = ({ selectedImage }) => {
  const keywordRefs = useRef({});
  const [likedElementTypes, setLikedElementTypes] = useState({
    "Subject matter": false, "Theme & mood": false,
    "Action & pose": false, "Arrangement": false,
  });

  const toggleLikedElementType= (type) => {
    setLikedElementTypes((prev) => ({
      ...prev, 
      [type]: !prev[type] }));
  }

  const addKeywordToBoard = (keyword) => {
    const bbox = keywordRefs.current[keyword._id]?.getBoundingClientRect();
    if (!bbox) return;
    const newOffset = calculateNewKeywordPosition(
      0,
      0,
      bbox.width,
      bbox.height,
      selectedImage.width,
      selectedImage.height
    );

    console.log(newOffset)
  }

  // Group keywords by type
  const groupedKeywords = selectedImage?.keywords.reduce((acc, keyword) => {
    if (!acc[keyword.type]) {
      acc[keyword.type] = [];
    }
    acc[keyword.type].push(keyword);
    return acc;
  }, {});

  // Update likedElementTypes when selectedImage changes
  useEffect(() => {
    if (!selectedImage) return;
    const updatedLikes = {
      "Subject matter": false, "Theme & mood": false,
      "Action & pose": false, "Arrangement": false,
    }
    selectedImage.keywords.forEach((keyword) => {
      if (keyword.offsetX !== undefined && keyword.offsetY !== undefined) {
        updatedLikes[keyword.type] = true;
      }
    });

    setLikedElementTypes(updatedLikes);
  }, [selectedImage]); 
 
    return (
      <>
        <img alt="" style={{ width: "95%", maxHeight: "40vh", marginTop: "1.5em" }} src={selectedImage.url} />
        <hr style={{
          border: "none",
          height: "1px",
          backgroundColor: "darkgrey",
          width: "100%",
          margin: "1.25em"
        }} />
        <div style={{ maxWidth: "95%" }}>
          <h3 style={{ marginBlock: "0", fontSize: "1.25em", textAlign: "left" }}>
            Why do you like this image?
          </h3>
          <p style={{ color: "grey", margin: "0", marginBottom: "1.5em" }}>
            Choose the keywords that you like about this image.
            </p>
            {Object.entries(groupedKeywords).map(([type, keywords]) => (
            <div key={type} style={{marginBottom:"0.4em"}}>
            <KeywordButton style={{width: "100%"}} text={`I like the ${type} of this image`} type={type} isSelected={likedElementTypes[type]} onClick={() => toggleLikedElementType(type)} />
            {likedElementTypes[type] &&
            <div style={{display: "flex", marginTop: "0.3em", marginBottom: "0.6em",  flexWrap: "wrap", overflowX: "auto", gap: "0.2em" }}>
                {keywords.map((keyword) => (
                    <KeywordButton
                    key={keyword._id}
                    ref={(el) => { console.log(el); console.log("tf")
                        if (el) keywordRefs.current[keyword._id] = el;
                    }}
                    text={keyword.keyword}
                    type={keyword.type}
                    isSelected={keyword.offsetX !== undefined && keyword.offsetY !== undefined}
                    onClick={() => addKeywordToBoard(keyword)}
                />
                ))}
            </div>}
            </div>
        ))}
        </div>
      </>
    );
  };

  
  
  export default KeywordSelection;