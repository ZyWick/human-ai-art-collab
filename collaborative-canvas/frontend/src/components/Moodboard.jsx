import React, {  useRef } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";

const Moodboard = ({ images, setImages, selectedImage, setSelectedImage, socket }) => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();

  return (
    <Stage width={windowSize.width} height={windowSize.height} ref={stageRef}>
      <Layer>
        {images.map((img) => (
          <ImageComponent
            key={img._id}
            imgData={img}
            setImages={setImages}
            socket={socket}
            stageRef={stageRef}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
