import React, { useMemo } from "react";
import { Label, Tag, Text } from "react-konva";
// import useItem from "../../../hook/useItem";
import colorMapping from "../config/keywordTypes";
import useLabelSelection from "../hook/useLabelSelection";
import { calculateNewKeywordPosition } from "../util/calculateNewKeywordPosition";

const KeywordItem = ({ data, imageBounds, updateKeywordPosition, socket}) => {
  // const { updateItem } = useItem();
  // const { attrs, keyword } = data;
  const labelEntity = {
    id: "custom-" + data.type + ": " + data.name,
    type: data.type,
    fileid: "custom",
    keyword: data.keyword,
  };
  
  const handleDrag = (e, action) => {
    e.cancelBubble = true;
    let newOffset = {newX: e.target.x(), newY: e.target.y()}
    let targetWidth = e.target.width();
    let targetHeight = e.target.height();
    
    if (action === "updateKeywordPosition")
      newOffset = calculateNewKeywordPosition(
        newOffset.newX, newOffset.newY, targetWidth, targetHeight, imageBounds?.width, imageBounds?.height
    );
    
    updateKeywordPosition({ _id: data._id, offsetX: newOffset.newX, offsetY: newOffset.newY });
    socket.emit(action, { 
      ...data, 
      offsetX: newOffset.newX, 
      offsetY: newOffset.newY 
    });
  };
  

  const { addSelectedLabel, removeSelectedLabel, selectedLabelList } = useLabelSelection();
  const isSelected = useMemo(() => {
    return selectedLabelList.some((label) => label.id === labelEntity.id);
  }, [selectedLabelList, labelEntity.id]);

  return (
    <KeywordLabel
      id={data._id}
      labelkey={labelEntity.id}
      xpos={data.offsetX}
      ypos={data.offsetY}
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
