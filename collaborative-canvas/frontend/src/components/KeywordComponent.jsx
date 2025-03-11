import React, { useEffect, useRef, useState } from "react";
import { Label, Tag, Text } from "react-konva";
import colorMapping from "../config/keywordTypes";
import { useDispatch } from "react-redux";
// import { calculateNewKeywordPosition } from "../util/keywordMovement";

const KeywordComponent = ({
  data,
  imageBounds,
  handleKeywordDrag,
  toggleSelected,
  deleteKeyword,
  // updateKeyword,
}) => {
  const keywordRef = useRef(null);
  const {
    x: imageX,
    y: imageY,
    // width: imageWidth,
    // height: imageHeight,
  } = imageBounds;
  const dispatch = useDispatch();
  const [isClicked, setIsCLicked] = useState(false);
  // const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && isClicked) {
        console.log("hello");
        deleteKeyword(data);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClicked, dispatch, data._id, deleteKeyword, data]);

  // const [kwSize, setKwSize] = useState({ width: 0, height: 0 });

  // useEffect(() => {
  //   if (keywordRef.current) {
  //     const { width, height } = keywordRef.current.getClientRect();
  //     setKwSize({ width, height });
  //   }
  // }, []);

  // TODO: Move on Transform. Buggy
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
  // }, [imageWidth, imageHeight, updateKeyword, data]);

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
      onClick={() => {
        toggleSelected(data);
        setIsCLicked(!isClicked);
      }}
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
