import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image, Transformer, Group, Rect} from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import useImageSelection from "../../hook/useImageSelection";
import { updateImage } from "../../redux/imagesSlice";
import { setSelectedImage, setSelectedKeyword } from "../../redux/selectionSlice";
import { selectParentThreadsByImage } from "../../redux/threadsSlice";
import { useSocket } from "../../context/SocketContext";
import ThreadBubble from "./ThreadBubble";

const ImageComponent = ({
  imgData,
  stageRef,
  setKeywordSelectionData,
  handleElementClick,
  handleThreadClick,
  setTooltipData,
  handleThreadHover,
}) => {
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const transformerRef = useRef();
  const dispatch = useDispatch();
  const socket = useSocket();
  const selectedImageId = useSelector(
    (state) => state.selection.selectedImageId
  );
  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const imageThreads = useSelector(selectParentThreadsByImage(imgData._id));

  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedImageId ? selectedImageId === imgData._id : false;
  
  useImageSelection(stageRef, imgData._id, imgData.keywords, setKeywordSelectionData);

  const handleClick = (e) => {
    if (isAddingComments) handleElementClick(e, { imageId: imgData._id });
    else {
      handleImageClick(e, imgData._id)
      dispatch(setSelectedImage(imgData._id));
      dispatch(setSelectedKeyword(null));
    }
  };

  const handleImageClick = useCallback((event, _id) => {
    event.cancelBubble = true;
    const rect = event.target.getClientRect();
    const position = { x: rect.x + rect.width + 20, y: rect.y };
    setKeywordSelectionData({ position, _id });
  }, [setKeywordSelectionData]);

  useEffect(() => {
    if (!imgData || !imgData.url) return;
    const img = new window.Image();
    img.src = imgData.url;
    img.onload = () => setImage(img);
    img.onerror = () => console.error("Failed to load image:", imgData.url);
  }, [imgData.url, imgData]);


  const handleDrag = (e, action) => {
    const update = {
      id: imgData._id,
      changes: {x: e.target.x(), y: e.target.y()},
    };
    dispatch(updateImage(update));
    socket.emit(action, update);
  };

  const handleTransform = (action, event) => {
    const node = imageRef.current;
    if (!node) return;

    const newWidth = imgData.width * node.scaleX();
    const newHeight = imgData.height * node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const update = {
      id: imgData._id,
      changes: {      
        width: newWidth,
        height: newHeight,
        x: node.x(),
        y: node.y()},
    };

    dispatch(updateImage(update));
    socket.emit(action, update);
  };

  useEffect(() => {
  if (transformerRef.current && imageRef.current) {
    const transformer = transformerRef.current;
    transformer.nodes([imageRef.current]);
    transformer.moveToTop();
    transformer.getLayer().batchDraw();
  }
}, [imageRef]);


  return image ? (
    <>
    
      <Group
        onMouseEnter={e => {
          const container = e.target.getStage().container();
          container.style.cursor = "pointer";
          setIsHovered(true)
        }}
        onMouseLeave={e => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
          setIsHovered(false)
        }}
          onClick={(e) => handleClick(e)}
          onTap={(e) => handleClick(e)}
      >
        <Image
          ref={imageRef}
          image={image}
          width={imgData.width}
          height={imgData.height}
          draggable
          x={imgData.x}
          y={imgData.y}
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
      {imageThreads &&
        imageThreads.map((thread, i) => (
          <ThreadBubble
            key={thread._id}
            thread={thread}
            position={{
              x: imgData.x + imgData.width - 15 - 35 * i,
              y: imgData.y - 20,
            }}
            onMouseEnter={(event) => handleThreadHover(event, thread)}
            onMouseLeave={() => setTooltipData(null)}
            onClick={(event) =>
              handleThreadClick(event, thread._id)
            }
          />
        ))}
        
    </>
  ) : null;
};

export default ImageComponent;
