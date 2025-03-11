import React, { useEffect, useRef, useState } from "react";
import { Label, Tag, Text } from "react-konva";
import colorMapping from "../config/keywordTypes";
import { useDispatch } from "react-redux";
import { calculateNewKeywordPosition } from "../util/keywordMovement";
import {updateBoardNoteKeywords} from '../redux/roomSlice'
import { removeKeywordFromSelected } from "../redux/selectionSlice";
import { deleteKeyword } from "../util/api";
import { useSocket } from "./SocketContext";

const KeywordComponent = ({
  data,
  imageBounds,
  stageRef,
  updateKeyword,
  updateImageKeyword
}) => {
  const keywordRef = useRef(null);
  const {
    x: imageX,
    y: imageY,
    width: imageWidth,
    height: imageHeight,
  } = imageBounds;
  const dispatch = useDispatch();
  const socket = useSocket()
  const [isClicked, setIsCLicked] = useState(false);
  // const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        setIsCLicked(false);
      }
    };

    const stage = stageRef?.current?.getStage();
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
  }, [stageRef]);


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

  const handleKeywordDrag = (e, action, keyword) => {
    e.cancelBubble = true;
    const isNote = !keyword.imageId
    
    const newOffset = isNote
      ? { offsetX: e.target.x(), offsetY: e.target.y() }
      : {
          offsetX: e.target.x() - imageX,
          offsetY: e.target.y() - imageY,
        };
  
    let newKeyword = { ...keyword, ...newOffset };
  
    if (!isNote && action === "updateKeyword") {
      newKeyword = {
        ...newKeyword,
        ...calculateNewKeywordPosition(
          newOffset.offsetX,
          newOffset.offsetY,
          e.target.width(),
          e.target.height(),
          imageWidth,
          imageHeight
        ),
      };
    }

    isNote ? dispatch(updateBoardNoteKeywords(newKeyword)) : updateKeyword(newKeyword);
    socket.emit(isNote ? action + "Note" : action, newKeyword);
  };
  
  const toggleSelected = (keyword) => {
    const updatedKeyword = { ...keyword, isSelected: !keyword.isSelected };
    const isNote = !keyword.imageId
    
    isNote
      ? dispatch(updateBoardNoteKeywords(updatedKeyword))
      : updateKeyword(updatedKeyword);

    socket.emit("toggleSelectedKeyword", keyword._id);
    socket.emit(isNote ? "updateKeywordNote" : "updateKeyword", updatedKeyword);
  };

  useEffect(() => {
    const deleteKeywordButton = async (keyword) => {
      try {
        if (!keyword.imageId) {
          socket.emit("deleteNoteKeyword", keyword._id);
          await deleteKeyword(keyword._id);
        } else {
          let { offsetX, offsetY, ...newKeyword1 } = keyword;
          const newKeyword2 = { ...newKeyword1, isSelected: false };
          
          dispatch(removeKeywordFromSelected(keyword._id))
          updateImageKeyword(newKeyword2)
          socket.emit("removeKeywordFromBoard", keyword._id);
          socket.emit("removeKeywordFromSelected",keyword._id)
        }
      } catch (e) {
        console.log(e);
      }
    };

    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && isClicked) {
        deleteKeywordButton(data);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClicked, dispatch, data._id, data, socket, updateImageKeyword]);
  
  return data.offsetX !== undefined && data.offsetY !== undefined ? (
    <KeywordLabel
      id={data._id}
      labelkey={labelEntity.id}
      xpos={data.offsetX + imageX}
      ypos={data.offsetY + imageY}
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
      onClick={() => {
        toggleSelected(data);
        setIsCLicked(true);
      }}
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
