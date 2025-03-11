import React, { useRef } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";
import { useSelector } from "react-redux";
import KeywordComponent from "./KeywordComponent";

const Moodboard = () => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();
  const images = useSelector((state) => state.images);
  const noteKeywords = useSelector((state) => state.room.boardNoteKeywords);


  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const scaleBy = 1.05; // Zoom sensitivity
    const oldScale = stage.scaleX();
    
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  
    // Adjust scale based on wheel direction
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  
    stage.scale({ x: newScale, y: newScale });
  
    // Keep the zoom centered around the mouse pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
  
    stage.position(newPos);
    stage.batchDraw(); // Optimize drawing performance
  };
  
  return (
    <Stage
      width={windowSize.width}
      height={windowSize.height}
      ref={stageRef}
      onWheel={handleWheel} // Enable zooming with mouse wheel
      draggable // Optional: Allow panning
    >
      <Layer>
        {images &&
          images.map((img) => (
            <ImageComponent key={img._id} imgData={img} stageRef={stageRef} />
          ))}
        {noteKeywords &&
          noteKeywords.map((kw) => (
            <KeywordComponent
              key={kw._id}
              data={kw}
              imageBounds={{ x: 0, y: 0 }}
            />
          ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
