import React, { useState,  } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from '../../context/SocketContext';
import "../../assets/styles/keywordSelection.css";
import KeywordSelection from "../widgets/KeywordSelection";
import ImageFeedback from "../widgets/ImageFeedback";
import { selectImageById } from "../../redux/imagesSlice";



const SelectedImage = ({selectedImageId}) => {
  const socket = useSocket();
  const dispatch =useDispatch();
  const [activeTab, setActiveTab] = useState("Add keywords");
  const selectedImage = useSelector(state => selectImageById(state, selectedImageId));

  const panels = {
    "Add keywords": (<KeywordSelection selectedImage={selectedImage} />
    ),
    "AI Analysis": <div>AI Analysis content goes here.</div>,
    "Feedback": <ImageFeedback selectedImage={selectedImage}></ImageFeedback>,
  };


  return (
    <>
      
      <img className="image-preview-selection" alt="" src={selectedImage?.url} />
      <hr className="divider" />
      <div>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "0.55em",
          paddingBottom: "1.25em",
        }}
      >
        {Object.keys(panels).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: activeTab === key ? "bold" : "normal",
              borderBottom: activeTab === key ? "0.5px solid black" : "none",
              cursor: "pointer",
              paddingBottom: "0.45em",
            }}
          >
            {key}
          </button>
        ))}
      </nav>
    </div>
    {panels[activeTab]}
    </>
  );
};


export default SelectedImage;