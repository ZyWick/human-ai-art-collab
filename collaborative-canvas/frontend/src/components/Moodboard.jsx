import React, { useState, useRef } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";

const Moodboard = ({ images, setImages, socket }) => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();
  const [selectedImageId, setSelectedImageId] = useState(null);

  const handleDelete = (_id) => {
    socket.emit("deleteImage", _id);
    setSelectedImageId(null);
  };

  return (
    <Stage width={windowSize.width} height={windowSize.height} ref={stageRef}>
      <Layer>
        {images.map((img) => (
          <ImageComponent
            key={img._id}
            onDelete={handleDelete}
            imgData={img}
            socket={socket}
            stageRef={stageRef}
            selectedImageId={selectedImageId}
            setSelectedImageId={setSelectedImageId}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
