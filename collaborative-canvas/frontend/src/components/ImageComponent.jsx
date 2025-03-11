import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image, Transformer, Group, Rect } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import KeywordComponent from "./KeywordComponent";
import useImageSelection from "../hook/useImageSelection";
import { updateImage } from "../redux/imagesSlice";
import { setSelectedImage } from "../redux/selectionSlice";
import { useSocket } from "./SocketContext";
import { calculateNewKeywordPosition } from "../util/keywordMovement";

const ImageComponent = ({ imgData, stageRef }) => {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef(null);
  const transformerRef = useRef();
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImageId = useSelector(
    (state) => state.selection.selectedImageId
  );
  const keywordRefs = useRef({});
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setKeywords(imgData.keywords);
  }, [imgData.keywords]);

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
  }, [imgData.url, imgData]);

  const isSelected = selectedImageId ? selectedImageId === imgData._id : false;

  const handleDrag = (e, action) => {
    const newImage = { ...imgData, x: e.target.x(), y: e.target.y() };
    dispatch(updateImage(newImage));
    socket.emit(action, newImage);
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

    dispatch(updateImage(newImage));
    socket.emit(action, newImage);
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

  const handleKeywordDrag = (e, action, keyword) => {
    e.cancelBubble = true;
    let newOffset = {
      newX: e.target.x() - imgData.x,
      newY: e.target.y() - imgData.y,
    };

    if (action === "updateKeyword")
      newOffset = calculateNewKeywordPosition(
        newOffset.newX,
        newOffset.newY,
        e.target.width(),
        e.target.height(),
        imgData.width,
        imgData.height
      );

    const newKeyword = {
      ...keyword,
      offsetX: newOffset.newX,
      offsetY: newOffset.newY,
    };
    updateKeyword(newKeyword);
    socket.emit(action, newKeyword);
  };

  const toggleSelected = (data) => {
    socket.emit("toggleSelectedKeyword", data._id);
    // dispatch(toggleSelectedKeyword(data._id))
    updateKeyword({ ...data, isSelected: !data.isSelected });
    socket.emit("updateKeyword", { ...data, isSelected: !data.isSelected });
  };

  const deleteKeyword = (keyword) => {
    let { offsetX, offsetY, ...newKeyword } = keyword;
    socket.emit("removeKeywordOffset", keyword._id);
    const updatedImage = {
      ...imgData,
      keywords: imgData.keywords.map((kw) =>
        kw._id === newKeyword._id ? newKeyword : kw
      ),
    };
    socket.emit("updateImage", updatedImage);
  };

  return image ? (
    <>
      <Group
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
            console.log(imgData._id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            dispatch(setSelectedImage(imgData._id));
            console.log(imgData._id);
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
        {!isSelected && isHovered && (
          <Rect
            x={imgData.x}
            y={imgData.y}
            width={imgData.width}
            height={imgData.height}
            stroke="rgb(109, 128, 212)"
            strokeWidth={2}
            listening={false} // Makes sure it doesn't interfere with interactions
          />
        )}
      </Group>
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
            handleKeywordDrag={handleKeywordDrag}
            toggleSelected={toggleSelected}
            deleteKeyword={deleteKeyword}
            updateKeyword={updateKeyword}
            ref={(el) => {
              if (el) keywordRefs.current[keyword._id] = el;
            }}
          />
        ))}
    </>
  ) : null;
};

export default ImageComponent;
