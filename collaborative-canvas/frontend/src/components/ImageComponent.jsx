import React, { useState, useEffect, useRef } from "react";
import { Image, Group, Transformer, Circle } from "react-konva";
import KeywordItem from "./KeywordItem";

const ImageComponent = ({
  socket,
  onDelete,
  imgData,
  stageRef,
  selectedImageId,
  setSelectedImageId,
}) => {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef();
  const [imageBounds, setImageBounds] = useState(null);
  const transformerRef = useRef();
  // const [isSelected, setIsSelected] = useState(false);
  
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

  const isSelected = selectedImageId === imgData._id; // Check if this image is selected

  // Handle keypress for deletion
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSelected && e.key === "Delete") {
        onDelete(imgData._id); // Call delete function
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, imgData._id, onDelete]);

  // Deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        setSelectedImageId(null); // Deselect all images
      }
    };

    const stage = stageRef.current?.getStage();
    if (stage) {
      stage.on("click", handleClickOutside);
      stage.on("tap", handleClickOutside);
    }

    return () => {
      if (stage) {
        stage.off("click", handleClickOutside);
        stage.off("tap", handleClickOutside);
      }
    };
  }, [stageRef, setSelectedImageId]);

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
      y: newY,
    });
  };

  return image ? (
    <Group
      draggable
      x={imgData.x}
      y={imgData.y}
      onClick={(e) => {
        e.cancelBubble = true; // Prevent event from reaching the stage
        setSelectedImageId(imgData._id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedImageId(imgData._id);
      }}
      onDragMove={(e) => handleDrag(e, "imageMoving")}
      onDragEnd={(e) => handleDrag(e, "updateImagePosition")}
    >
      <Image ref={imageRef} image={image} onTransformEnd={handleTransform} />
      {isSelected && (
        <Transformer ref={transformerRef} nodes={[imageRef.current]} />
      )}
      {keywords.map((keyword) => (
        <KeywordItem
          key={keyword._id}
          data={keyword}
          imageBounds={imageBounds}
          updateKeywordPosition={updateKeywordPosition}
          socket={socket}
        ></KeywordItem>
      ))}
    </Group>
  ) : null;
};

export default ImageComponent;
