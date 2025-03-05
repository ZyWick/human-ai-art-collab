import React, { useState, useEffect, useRef } from "react";
import { Image, Group, Transformer} from "react-konva";
import KeywordItem from "./KeywordItem";

const ImageComponent = ({socket, imgData }) => {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef();
  const [imageBounds, setImageBounds] = useState(null);
  const transformerRef = useRef();
  const [isSelected, setIsSelected] = useState(false);

  const handleTransform = () => {
    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Update image size and reset scale
    const newWidth = imgData.width * scaleX;
    const newHeight = imgData.height * scaleY;

    socket.emit("updateImageSize", {
      ...imgData,
      width: newWidth,
      height: newHeight,
    });

    node.scaleX(1);
    node.scaleY(1);
  };
 

  useEffect(() => {
    const img = new window.Image();
    img.src = imgData.url;
    img.onload = () => setImage(img);
    img.onerror = () => console.error("Failed to load image:", imgData.url);
  }, [imgData.url]);

  useEffect(() => {
    if (imageRef.current) {
      setImageBounds(imageRef.current.getClientRect()); // Update bounds when image moves
    }
  }, [imgData.x, imgData.y, image]); // Ensure it runs after image loads
  
  const updateKeywordPosition = ({ _id, offsetX, offsetY }) => {
    // console.log({_id, offsetX, offsetY})
    setKeywords((prev) =>
      prev.map((kw) => (kw._id === _id ? { ...kw, offsetX, offsetY } : kw))
    );
  };
  
  useEffect(() => {
    socket.on("updateKeywordPosition", updateKeywordPosition);
    return () => socket.off("updateKeywordPosition", updateKeywordPosition);
  }, [updateKeywordPosition]);

  const handleDrag = (e, action) => {
    const newX = e.target.x();
    const newY = e.target.y();

    socket.emit(action, { 
      ...imgData, 
      x: newX, 
      y: newY 
    });
  };  

  return image ? (
    <Group 
      draggable 
      x={imgData.x} 
      y={imgData.y} 
      onClick={() => setIsSelected(true)}
      onTap={() => setIsSelected(true)}
      onDragMove={(e) => handleDrag(e, "imageMoving")} 
      onDragEnd={(e) => handleDrag(e, "updateImagePosition")}
    >
      <Image ref={imageRef} image={image} onTransformEnd={handleTransform}/>
      {/* {isSelected && <Transformer ref={transformerRef} nodes={[imageRef.current]} />} */}
      {keywords.map((keyword) => 
        <KeywordItem 
          key={keyword._id} 
          data={keyword}
          imageBounds={imageBounds}
          updateKeywordPosition={updateKeywordPosition}
          socket={socket}>
        </KeywordItem>)}
    </Group>)
    : null;
};

export default ImageComponent;