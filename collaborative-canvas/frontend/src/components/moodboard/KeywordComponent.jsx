import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label, Tag, Text, Group } from "react-konva";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import { selectBoardById } from "../../redux/boardsSlice";
import { removeKeywordFromSelected } from "../../redux/selectionSlice";
import { useSocket } from "../../context/SocketContext";
import { updateKeyword } from "../../redux/keywordsSlice";
import { selectImageById } from "../../redux/imagesSlice";
import { setSelectedKeyword } from "../../redux/selectionSlice";

import colorMapping from "../../config/keywordTypes";
import ThreadBubble from "./ThreadBubble";
import VotingButtons from "./VotingButtons";
import { selectParentThreadsByKeyword } from "../../redux/threadsSlice";

const KeywordComponent = ({
  data,
  stageRef,
  handleElementClick,
  handleThreadClick,
  setTooltipData,
  handleThreadHover,
}) => {
  const keywordRef = useRef(null);
  const dispatch = useDispatch();
  const socket = useSocket();

  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const [hovered, setHovered] = useState(false);
    const keywordThreads = useSelector(selectParentThreadsByKeyword(data._id));
  
  const selectedKeywordId = useSelector(
    (state) => state.selection.selectedKeywordId
  );

  const kwBoard = useSelector((state) => selectBoardById(state, data.boardId));
  const isVoting = kwBoard.isVoting;
  const image = useSelector((state) => selectImageById(state, data.imageId));

  const imageX = image?.x ?? 0;
  const imageY = image?.y ?? 0;
  const imageWidth = image?.width ?? 100; // Default width
  const imageHeight = image?.height ?? 100; // Default height

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        dispatch(setSelectedKeyword(null));
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
  }, [stageRef, dispatch]);

  const handleClick = (e) => {
    if (isAddingComments) {
      handleElementClick(e, { keywordId: data._id });
    } else {
      toggleSelected(e);
      dispatch(setSelectedKeyword(data._id));
    }
  };

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
    const isNote = !data.imageId;
    const target = e.target;

    let newOffset = {
      offsetX: target.x() - (isNote ? 0 : imageX),
      offsetY: target.y() - (isNote ? 0 : imageY),
    };

    if (!isNote && action === "updateKeywordOffset") {
      newOffset = calculateNewKeywordPosition(
        newOffset.offsetX,
        newOffset.offsetY,
        target.width(),
        target.height(),
        imageWidth,
        imageHeight
      );
    }

    const update = {
      id: data._id,
      changes: newOffset,
    };

    dispatch(updateKeyword(update));
    socket.emit(action, update);
  };

  const toggleSelected = (e) => {
    e.cancelBubble = true;
    const update = { id: data._id, changes: { isSelected: !data.isSelected } };
    dispatch(updateKeyword(update));
    socket.emit("toggleSelectedKeyword", data._id);
    socket.emit("updateKeywordSelected", update);
};

  useEffect(() => {
    const deleteKeywordButton = async () => {
      try {
        if (!data.imageId) {
          socket.emit("deleteKeyword", {
            imageId: data.imageId,
            keywordId: data._id,
          });
          // await deleteKeyword(data._id);
        } else {
          dispatch(removeKeywordFromSelected(data._id));
          socket.emit("removeKeywordFromSelected", data._id);

          dispatch(
            updateKeyword({
              id: data._id,
              changes: {
                offsetX: undefined,
                offsetY: undefined,
                isSelected: false,
              },
            })
          );
          socket.emit("removeKeywordFromBoard", data._id);
        }
      } catch (e) {
        console.log(e);
      }
    };

    const handleKeyDown = (event) => {
      const isClicked = selectedKeywordId
        ? selectedKeywordId === data._id
        : false;
      if ((event.key === "Delete" || event.key === "Backspace") && isClicked) {
        deleteKeywordButton();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedKeywordId, dispatch, data._id, data, socket]);

  return data.offsetX !== undefined && data.offsetY !== undefined ? (
    <>
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
        onDragEnd={(e) => handleKeywordDrag(e, "updateKeywordOffset")}
        onMouseEnter={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "pointer";
          setHovered(true);
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
          setHovered(false);
        }}
        onClick={(e) => handleClick(e)}
        keywordRef={keywordRef}
        isVoting={isVoting}
        hovered={hovered}
        votes={data.votes}
        downvotes={data.downvotes}
        imageId={data.imageId}
        keywordThreads={keywordThreads}
        handleThreadHover={handleThreadHover}
        handleThreadClick={handleThreadClick}
        setTooltipData={setTooltipData}
      />
    </>
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
  onMouseEnter,
  onMouseLeave,
  keywordRef,
  votes,
  downvotes,
  isVoting,
  hovered,
  imageId,
  keywordThreads,
  handleThreadHover,
  handleThreadClick,
  setTooltipData
}) => {
  const textRef = useRef();
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.width()); // Get actual text width
    }
  }, [text]);
  

  return (
    <Group>
      <Label
        id={id}
        x={xpos}
        y={ypos}
        key={labelkey}
        onClick={onClick}
        draggable={draggable}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Tag
          name="label-tag"
          pointerDirection="left"
          fill={isSelected ? colorMapping[type] : "transparent"}
          strokeWidth={1}
          stroke={colorMapping[type]}
          cornerRadius={4}
          ref={keywordRef}
          shadowColor={hovered ? colorMapping[type] : "transparent"}
          shadowBlur={hovered ? 5 : 0}
          shadowOpacity={hovered ? 2 : 0}
        />
        <Text
          ref={textRef}
          text={text}
          name="label-text"
          fontSize={14}
          fontFamily={"Noto Sans"}
          lineHeight={1}
          padding={8}
          fill={isSelected ? "white" : colorMapping[type]}
        />
      </Label>
      {keywordThreads &&
        keywordThreads.map((thread, i) => (
          <ThreadBubble
            key={thread._id}
            thread={thread}
            position={{
              x: xpos + textWidth - 15 - 35 * i,
              y: ypos - 35,
            }}
            onMouseEnter={(event) => handleThreadHover(event, thread)}
            onMouseLeave={() => setTooltipData(null)}
            onClick={(event) => handleThreadClick(event, thread._id)}
          />
        ))}
      {isVoting && (
        <VotingButtons
          _id={id}
          kwVotes={votes}
          kwDownvotes={downvotes}
          type={type}
          xpos={xpos + textWidth + 10}
          ypos={ypos - 10}
        />
      )}
    </Group>
  );
};

export default KeywordComponent;
