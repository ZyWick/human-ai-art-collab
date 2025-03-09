import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {KeywordButton } from "../widgets/KeywordButton";

const OutputHub = () => {
    const selectedKeywordIds = useSelector((state) => state.selection.selectedKeywordIds);
    const images = useSelector((state) => state.images);
    const noteKeywords = useSelector((state) => state.room.boardNoteKeywords);
    const keywordRefs = useRef({})
    // const selectedKeywords = [
    //     ...images.flatMap(image => image.keywords).filter(keyword => keyword.isSelected), // Get selected keywords from images
    //     ...noteKeywords.filter(keyword => keyword.isSelected) // Add selected keywords from extraKeywords
    // ];
    const imageKeywords = images.flatMap(image => image.keywords);

    // Merge all keyword sources
    const allKeywords = [...imageKeywords, ...noteKeywords];
    
    // Filter only the selected keywords
    const selectedKeywords = allKeywords.filter(keyword => selectedKeywordIds.includes(keyword._id));
    
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
    <div style={{width: "90%", 
        display: "flex",
        justifyContent: "center",
        overflowX: "auto",
        flexWrap: "wrap",
        gap: "0.2em",
        }}>
         {selectedKeywords.map((keyword) => (
                  <KeywordButton
                    key={keyword._id}
                    ref={(el) => {
                      if (el) keywordRefs.current[keyword._id] = el;
                    }}
                    text={keyword.keyword}
                    type={keyword.type}
                    isSelected={true}
                  />
        ))}
    </div>
    <hr
        style={{
          border: "none",
          height: "0.05em",
          backgroundColor: "darkgrey",
          width: "100%",
        }}
      />
      <div style={{width: "100%", marginTop: "auto",  marginBottom: "2.5em",}}>
        <hr
        style={{
          border: "none",
          minHeight: "0.05em",
          backgroundColor: "darkgrey",
          width: "100%",
        }}
      />
<button
  style={{
    border: "none",
    background: "transparent",
    color: "#444", // Darker default text
    width: "100%",
    padding: "14px 0",
    fontSize: "16px", // Slightly bigger text
    fontWeight: "500", // Medium weight for better readability
    cursor: "pointer",
    transition: "background 0.3s ease, color 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "rgba(169, 169, 169, 0.15)"; // Light grey hover effect
    e.target.style.color = "black";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "transparent";
    e.target.style.color = "#444";
  }}
>
  Generate sketches
</button>



      </div>
    </div>
  );
};

export default OutputHub;
