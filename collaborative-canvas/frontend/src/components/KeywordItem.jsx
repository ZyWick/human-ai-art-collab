import React, { useMemo, useEffect, useRef } from "react";
import { Label, Tag, Text } from "react-konva";
// import useItem from "../../../hook/useItem";
import colorMapping from "../config/keywordTypes";
import useLabelSelection from "../hook/useLabelSelection";
import { handleKeywordPositionUpdate } from "../util/keywordMovement";

const KeywordItem = ({ data, imageBounds, updateKeywordPosition, socket }) => {

  const keywordRef = useRef(null);
  const { width: imageWidth, height: imageHeight, x: imageX, y: imageY } = imageBounds;

  useEffect(() => {
    if (keywordRef.current) {
      const bbox = keywordRef.current.getClientRect();
      handleKeywordPositionUpdate(
        data._id,
        data.offsetX,
        data.offsetY,
        bbox.width,
        bbox.height,
        imageWidth,
        imageHeight,
        updateKeywordPosition,
        socket
      );
    }
  }, [imageWidth, imageHeight, socket, updateKeywordPosition]);

  const labelEntity = {
    id: "custom-" + data.type + ": " + data.name,
    type: data.type,
    fileid: "custom",
    keyword: data.keyword,
  };

  const handleDrag = (e, action) => {
    e.cancelBubble = true;
    let newOffset = { newX: e.target.x() - imageX, newY: e.target.y() - imageY};
    let targetWidth = e.target.width();
    let targetHeight = e.target.height();

    if (action === "updateKeywordPosition")
      newOffset = handleKeywordPositionUpdate(
        data,
        newOffset.newX,
        newOffset.newY,
        targetWidth,
        targetHeight,
        imageWidth,
        imageHeight,
        updateKeywordPosition,
        socket
      );
  
    socket.emit(action, {
      ...data,
      offsetX: newOffset.newX,
      offsetY: newOffset.newY,
    });
  };

  const { addSelectedLabel, removeSelectedLabel, selectedLabelList } =
    useLabelSelection();
  const isSelected = useMemo(() => {
    return selectedLabelList.some((label) => label.id === labelEntity.id);
  }, [selectedLabelList, labelEntity.id]);

  return (
    <KeywordLabel
      id={data._id}
      labelkey={labelEntity.id}
      xpos={data.offsetX + imageX}
      ypos={data.offsetY + imageY}
      onClick={() => {
        if (isSelected) removeSelectedLabel(labelEntity.id);
        else addSelectedLabel(labelEntity);
      }}
      isSelected={isSelected}
      type={labelEntity.type}
      text={
        labelEntity.type === "Arrangement"
          ? labelEntity.type
          : labelEntity.type + ": " + labelEntity.keyword
      }
      draggable={true}
      // onDragEnd={(e) => {
      //   updateItem(e.currentTarget.id(), () => ({
      //     ...e.currentTarget.attrs,
      //     updatedAt: Date.now(),
      //   }));
      // }}
      onDragMove={(e) => handleDrag(e, "keywordMoving")}
      onDragEnd={(e) => handleDrag(e, "updateKeywordPosition")}
      keywordRef={keywordRef}
    />
  );
};

export const KeywordLabel = ({
  id,
  labelkey,
  xpos,
  ypos,
  onClick,
  isSelected,
  type,
  text,
  draggable,
  onDragMove,
  onDragEnd,
  keywordRef
}) => {
  return (
    <Label
      id={id}
      x={xpos}
      y={ypos}
      key={labelkey}
      onClick={onClick}
      draggable={draggable}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      ref={keywordRef}
    >
      <Tag
        name="label-tag"
        pointerDirection="left"
        fill={isSelected ? colorMapping[type] : "transparent"}
        strokeWidth={1}
        stroke={colorMapping[type]}
        cornerRadius={4}
      />
      <Text
        text={text}
        name="label-text"
        fontSize={14}
        fontFamily={"Noto Sans"}
        lineHeight={1}
        padding={8}
        fill={isSelected ? "white" : colorMapping[type]}
      />
    </Label>
  );
};

export default KeywordItem;
