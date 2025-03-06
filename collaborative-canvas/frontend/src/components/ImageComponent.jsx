import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image, Transformer } from "react-konva";
import KeywordItem from "./KeywordItem";
import useImageSelection from "../hook/useImageSelection";

const ImageComponent = ({
  socket,
  imgData,
  setImages,
  stageRef,
  selectedImageId,
  setSelectedImageId,
}) => {;
  const [image, setImage] = useState(null);
  // const [imageBounds, setImageBounds] = useState({width: imgData.width, height: imgData.height, x: imgData.x, y: imgData.y});
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef(null);
  const transformerRef = useRef();
  const imageBounds = {width: imgData.width, height: imgData.height, x: imgData.x, y: imgData.y};

  useImageSelection(stageRef, selectedImageId, setSelectedImageId, imgData._id, socket);

  const isSelected = selectedImageId === imgData._id;

  useEffect(() => {
    const img = new window.Image();
    img.src = imgData.url;
    img.onload = () => setImage(img);
    img.onerror = () => console.error("Failed to load image:", imgData.url);
  }, [imgData.url]);


  const handleDrag = (e, action) => {
    const newX = e.target.x();
    const newY = e.target.y();
  
    socket.emit(action, {
      ...imgData,
      x: newX,
      y: newY,
    });

    setImages((prev) =>
      prev.map((img) => (img._id === imgData._id ? { ...imgData, x: newX, y: newY, } : img))
    );
  
  };

  const handleTransform = (action, event) => {
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = imgData.width * scaleX;
    const newHeight = imgData.height * scaleY;
    const newX = node.x();
    const newY = node.y();
    node.scaleX(1);
    node.scaleY(1);

    socket.emit(action, {
      ...imgData,
      width: newWidth,
      height: newHeight, 
      x: newX, y: newY 
    });

    setImages((prev) =>
      prev.map((img) =>
        img._id === imgData._id
          ? { ...img, width: newWidth, height: newHeight,     
            x: newX, y: newY, 
          } : img
      )
    );

  };

  const updateKeywordPosition = useCallback(({ _id, offsetX, offsetY }) => {
    setKeywords((prev) =>
      prev.map((kw) => (kw._id === _id ? { ...kw, offsetX, offsetY } : kw))
    );
  }, [setKeywords]);

  useEffect(() => {
    socket.on("updateKeywordPosition", updateKeywordPosition);
    return () => socket.off("updateKeywordPosition", updateKeywordPosition);
  }, [updateKeywordPosition, socket]);

  return image ? (<>
       <Image ref={imageRef} image={image} width={imgData.width} height={imgData.height}
      draggable
      x={imgData.x}
      y={imgData.y}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelectedImageId(imgData._id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedImageId(imgData._id);
      }}
      onDragMove={(e) => handleDrag(e, "imageMoving")}
      onDragEnd={(e) => handleDrag(e, "updateImagePosition")}
      onTransform={(e) => handleTransform("imageTransforming", e)}
      onTransformEnd={(e) => handleTransform("updateImageTransformation", e)} />
      {isSelected && imageRef.current && <Transformer keepRatio={true} ref={transformerRef} nodes={[imageRef.current]} rotateEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}/>}
      {keywords.map((keyword) => (
        <KeywordItem
          key={keyword._id}
          data={keyword}
          imageBounds={imageBounds}
          updateKeywordPosition={updateKeywordPosition}
          socket={socket}
        ></KeywordItem>
      ))}
     </>
  ) : null;
};

export default ImageComponent;
