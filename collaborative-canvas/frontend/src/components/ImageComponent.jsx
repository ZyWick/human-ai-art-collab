import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image, Transformer } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import KeywordComponent from "./KeywordComponent";
import useImageSelection from "../hook/useImageSelection";
import { updateImage, updateKeywords } from "../redux/imagesSlice";
import { setSelectedImage } from "../redux/selectionSlice";
import { useSocket } from "./SocketContext";

const ImageComponent = ({ imgData, stageRef }) => {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef(null);
  const transformerRef = useRef();
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImageId = useSelector((state) => state.selection.selectedImageId);

  useImageSelection(stageRef, imgData._id);
  const imageBounds = {
    width: imgData.width,
    height: imgData.height,
    x: imgData.x,
    y: imgData.y,
  };
  useEffect(() => {
    if (!imgData || !imgData.url) return;
    const img = new window.Image();
    img.src = imgData.url;
    img.onload = () => setImage(img);
    img.onerror = () => console.error("Failed to load image:", imgData.url);
  }, [imgData.url]);

  const isSelected = selectedImageId ? 
    selectedImageId === imgData._id : false;

  const handleDrag = (e, action) => {
    const newImage = { ...imgData, x: e.target.x(), y: e.target.y() };
    socket.emit(action, newImage);
    dispatch(updateImage(newImage));
  };

  const handleTransform = (action, event) => {
    const node = imageRef.current;
    if (!node) return;

    const newWidth = imgData.width * node.scaleX();
    const newHeight = imgData.height * node.scaleY();
    const newImage = {
      ...imgData,
      width: newWidth,
      height: newHeight,
      x: node.x(),
      y: node.y(),
    };
    node.scaleX(1);
    node.scaleY(1);

    socket.emit(action, newImage);
    dispatch(updateImage(newImage));
  };

  const updateKeyword = useCallback(
    (newKeyword) => {
      setKeywords((prev) =>
        prev.map((kw) => (kw._id === newKeyword._id ? newKeyword : kw))
      );
    },
    [setKeywords]
  );

  useEffect(() => {
    socket.on("updateKeyword", updateKeyword);
    return () => socket.off("updateKeyword", updateKeyword);
  }, [updateKeyword, socket]);

  return image ? (
    <>
      <Image
        ref={imageRef}
        image={image}
        width={imgData.width}
        height={imgData.height}
        draggable
        x={imgData.x}
        y={imgData.y}
        onClick={(e) => {
          e.cancelBubble = true;
          dispatch(setSelectedImage(imgData._id));
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          dispatch(setSelectedImage(imgData._id));
        }}
        onDragMove={(e) => handleDrag(e, "imageMoving")}
        onDragEnd={(e) => handleDrag(e, "updateImage")}
        onTransform={(e) => handleTransform("imageTransforming", e)}
        onTransformEnd={(e) => handleTransform("updateImage", e)}
      />
      {isSelected && imageRef.current && (
        <Transformer
          keepRatio={true}
          ref={transformerRef}
          nodes={[imageRef.current]}
          rotateEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      )}
      {keywords
        .filter(
          (keyword) =>
            keyword.offsetX !== undefined && keyword.offsetY !== undefined
        )
        .map((keyword) => (
          <KeywordComponent
            key={keyword._id}
            data={keyword}
            imageBounds={imageBounds}
            updateKeyword={updateKeyword}
          />
        ))}
    </>
  ) : null;
};

export default ImageComponent;
