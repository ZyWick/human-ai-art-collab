import React, { useMemo, useEffect, useRef } from "react";
import { Label, Tag, Text } from "react-konva";
import colorMapping from "../config/keywordTypes";
import { useSocket } from "./SocketContext";
import { useDispatch, useSelector } from "react-redux";

const KeywordComponent = ({ data, imageBounds, handleKeywordDrag, toggleSelected }) => {
  const keywordRef = useRef(null);
  const {x: imageX, y: imageY, } = imageBounds;
  const dispatch = useDispatch();
  const socket = useSocket();
  const selecteds = useSelector((state) => state.selection.selectedKeywordIds);
  
  // TODO: Move to imageComponent. Similar to ImageSelection
  // useEffect(() => {
  //   if (keywordRef.current) {
  //     const bbox = keywordRef.current.getClientRect();
  //     const newOffset = calculateNewKeywordPosition(
  //       data.offsetX,
  //       data.offsetY,
  //       bbox.width,
  //       bbox.height,
  //       imageWidth,
  //       imageHeight,
  //     );
  //   const newKeyword = {
  //     ...data,
  //     offsetX: newOffset.newX,
  //     offsetY: newOffset.newY,
  //   };

  //   if (
  //     newKeyword.offsetX !== data.offsetX ||
  //     newKeyword.offsetY !== data.offsetY
  //   ) {
  //     updateKeyword(newKeyword);
  //   }
  // }
  // }, [imageWidth, imageHeight]);

  const labelEntity = {
    id: "custom-" + data.type + ": " + data.name,
    type: data.type,
    fileid: "custom",
    keyword: data.keyword,
  };


  // const { addSelectedLabel, removeSelectedLabel, selectedLabelList } =
  //   useLabelSelection();
  // const isSelected = useMemo(() => {
  //   return selectedLabelList.some((label) => label.id === labelEntity.id);
  // }, [selectedLabelList, labelEntity.id]);

  return data.offsetX !== undefined && data.offsetY !== undefined ? (
    <KeywordLabel
      id={data._id}
      labelkey={labelEntity.id}
      xpos={data.offsetX + imageX}
      ypos={data.offsetY + imageY}
      onClick={() => toggleSelected(data)}
      isSelected={data.isSelected}
      type={labelEntity.type}
      text={
        labelEntity.type === "Arrangement"
          ? labelEntity.type
          : labelEntity.type + ": " + labelEntity.keyword
      }
      draggable={true}
      onDragMove={(e) => handleKeywordDrag(e, "keywordMoving", data)}
      onDragEnd={(e) => handleKeywordDrag(e, "updateKeyword", data)}
      keywordRef={keywordRef}
    />
  ) : null;  
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
  keywordRef,
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

export default KeywordComponent;
