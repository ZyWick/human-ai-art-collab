import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image, Transformer, Group, Rect } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import KeywordComponent from "./KeywordComponent";
import useImageSelection from "../../hook/useImageSelection";
import { updateImage } from "../../redux/imagesSlice";
import { setSelectedImage } from "../../redux/selectionSlice";
import { useSocket } from "../../context/SocketContext";
import ThreadBubble from "./ThreadBubble";

const ImageComponent = ({
  imgData,
  stageRef,
  handleElementClick,
  onReply,
  handleThreadClick,
  setTooltipData,
  handleThreadHover,
}) => {
  const [image, setImage] = useState(null);
  const [keywords, setKeywords] = useState(imgData.keywords || []);
  const imageRef = useRef(null);
  const transformerRef = useRef();
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImageId = useSelector(
    (state) => state.selection.selectedImageId
  );
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const imageThreads = imgData.parentThreads;
  const handleClick = (e) => {
    if (isAddingComments) handleElementClick(e, { imageId: imgData._id });
    else dispatch(setSelectedImage(imgData._id));
  };

  const [isHovered, setIsHovered] = useState(false);
  console.log(imgData)
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

  const updateImageKeyword = (newKeyword) => {
    const updatedImage = {
      ...imgData,
      keywords: imgData.keywords.map((kw) =>
        kw._id === newKeyword._id ? newKeyword : kw
      ),
    };
    dispatch(updateImage(updatedImage));
    socket.emit("updateImage", updatedImage);
  };

  useEffect(() => {
    socket.on("updateKeyword", updateKeyword);
    return () => socket.off("updateKeyword", updateKeyword);
  }, [updateKeyword, socket]);

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
          onClick={(e) => handleClick(e)}
          onTap={(e) => handleClick(e)}
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
            stageRef={stageRef}
            updateKeywords={updateKeyword}
            updateKeyword={updateKeyword}
            updateImageKeyword={updateImageKeyword}
            handleElementClick={handleElementClick}
            setTooltipData={setTooltipData}
            handleThreadClick={handleThreadClick}
            handleThreadHover={handleThreadHover}
          />
        ))}
      {imageThreads && 
        imageThreads.map((thread, i) => (
          <ThreadBubble
            key={thread._id}
            thread={thread}
            position={{x: imgData.x + imgData.width -  15 - 35 * i, y: imgData.y - 20}}
            onMouseEnter={(event) => handleThreadHover(event, thread)}
            onMouseLeave={() => setTooltipData(null)}
            onClick={(event) =>handleThreadClick(event, thread, {type: "imageId", _id: imgData._id})}
          />
        ))}
    </>
  ) : null;
};

export default ImageComponent;
