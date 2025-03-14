import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label, Tag, Text, Group, Rect } from "react-konva";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import {updateBoardNoteKeywords} from '../../redux/roomSlice'
import { selectBoardById } from "../../redux/boardsSlice";
import { removeKeywordFromSelected } from "../../redux/selectionSlice";
import { deleteKeyword } from "../../util/api";
import { useSocket } from '../../context/SocketContext'
import { useAuth } from "../../context/AuthContext";
import colorMapping from "../../config/keywordTypes";

const KeywordComponent = ({
  data,
  imageBounds,
  stageRef,
  updateKeyword,
  updateImageKeyword,
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
  const { user } = useAuth();
  const [isClicked, setIsCLicked] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const isVotedByUser = data.votes?.includes(user.id)
  const votesNumber = data.votes?.length
  const kwBoard = useSelector((state) =>
    selectBoardById(state, data.boardId)
  );
  const isVoting = kwBoard.isVoting
  useEffect(() => {
  if (keywordRef.current) {
    setTextWidth(keywordRef.current.getClientRect().width);
  }
}, [keywordRef])

  const handleVoteClick = (e) =>{
    e.cancelBubble = true;
    const userId = user.id
    const updatedVotes = data.votes?.includes(userId)
        ? data.votes.filter(id => id !== userId) // Remove user.id if it's already there
        : [...(data.votes || []), userId]; // Add user.id if it's not there

    const updatedKeyword = { ...data, votes: updatedVotes };
    const isNote = !data.imageId

    isNote
      ? dispatch(updateBoardNoteKeywords(updatedKeyword))
      : updateKeyword(updatedKeyword);

    socket.emit("updateKeywordVotes", {keywordId: data._id, userId, isNote});
 }

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


  const handleKeywordDrag = (e, action) => {
    e.cancelBubble = true;
    const isNote = !data.imageId
    
    const newOffset = isNote
      ? { offsetX: e.target.x(), offsetY: e.target.y() }
      : {
          offsetX: e.target.x() - imageX,
          offsetY: e.target.y() - imageY,
        };
  
    let newKeyword = { ...data, ...newOffset };
  
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
  
  const toggleSelected = (e) => {
    e.cancelBubble = true;
    const updatedKeyword = { ...data, isSelected: !data.isSelected };
    const isNote = !data.imageId
    
    isNote
      ? dispatch(updateBoardNoteKeywords(updatedKeyword))
      : updateKeyword(updatedKeyword);

    socket.emit("toggleSelectedKeyword", data._id);
    socket.emit(isNote ? "updateKeywordNote" : "updateKeyword", updatedKeyword);
  };

  useEffect(() => {
    const deleteKeywordButton = async () => {
      try {
        if (!data.imageId) {
          socket.emit("deleteNoteKeyword", data._id);
          await deleteKeyword(data._id);
        } else {
          let { offsetX, offsetY, ...newKeyword1 } = data;
          const newKeyword2 = { ...newKeyword1, isSelected: false };
          
          dispatch(removeKeywordFromSelected(data._id))
          updateImageKeyword(newKeyword2)
          socket.emit("removeKeywordFromBoard", data._id);
          socket.emit("removeKeywordFromSelected",data._id)
        }
      } catch (e) {
        console.log(e);
      }
    };

    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && isClicked) {
        deleteKeywordButton();
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
      onDragMove={(e) => handleKeywordDrag(e, "keywordMoving")}
      onDragEnd={(e) => handleKeywordDrag(e, "updateKeyword")}
      onClick={(e) => {
        toggleSelected(e);
        setIsCLicked(true);
      }}
      keywordRef={keywordRef}
      textWidth={textWidth}
      votesNumber={votesNumber}
      isVotedByUser={isVotedByUser}
      isVoting={isVoting}
      handleVoteClick={handleVoteClick}
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
  textWidth,
  votesNumber,
  isVotedByUser,
  isVoting,
  handleVoteClick
}) => {
  return (<Group>
    <Label
      id={id}
      x={xpos}
      y={ypos}
      key={labelkey}
      onClick={onClick}
      draggable={draggable}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      handleVoteClick={handleVoteClick}
    >
      <Tag
        name="label-tag"
        pointerDirection="left"
        fill={isSelected ? colorMapping[type] : "transparent"}
        strokeWidth={1}
        stroke={colorMapping[type]}
        cornerRadius={4}
        ref={keywordRef}
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
    {isVoting &&
    <Group x={textWidth + xpos + 5} y={ypos -10} 
      onClick={(e) => handleVoteClick(e)} 
      cursor="pointer">
        <Rect
          width={35}
          height={20}
          fill={isVotedByUser ? colorMapping[type] : "transparent"}
          cornerRadius={5}
          shadowBlur={1}
          stroke={colorMapping[type]}
          strokeWidth={0.5}
        />
        <Text
          text={`👍${votesNumber}`}
          fontSize={10}
          fill={isVotedByUser ? "white" : colorMapping[type]}
          align="center"
          width={35}
          height={20}
          verticalAlign="middle"
        />
      </Group>}
    </Group>
  );
};

export default KeywordComponent;
