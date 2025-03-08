import React, { useRef } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";
import { useSelector } from "react-redux";

const Moodboard = () => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();
  const images = useSelector((state) => state.images);

  return (
    <Stage width={windowSize.width} height={windowSize.height} ref={stageRef}>
      <Layer>
        {images &&
          images.map((img) => (
            <ImageComponent key={img._id} imgData={img} stageRef={stageRef} />
          ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
