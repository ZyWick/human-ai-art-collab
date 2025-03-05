import React, { useState, useRef } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";

const Moodboard = ({ images, socket }) => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();

  return (
   <Stage width={windowSize.width } height={windowSize.height} ref={stageRef}>
          <Layer>
            {images.map((img) => 
            <ImageComponent key={img._id} imgData={img} socket={socket}/>
            )}
          </Layer>
        </Stage>
  );
};

export default Moodboard;
