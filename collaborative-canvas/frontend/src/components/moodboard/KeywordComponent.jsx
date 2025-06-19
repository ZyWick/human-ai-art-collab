import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useDispatchWithMeta from "../../hook/useDispatchWithMeta";
import { Label, Tag, Text, Group, Circle } from "react-konva";
import { calculateNewKeywordPosition } from "../../util/keywordMovement";
import { selectBoardById } from "../../redux/boardsSlice";
import {
  addSelectedKeyword,
  removeSelectedKeyword,
} from "../../redux/selectionSlice";
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
  const dispatch = useDispatchWithMeta();
  const socket = useSocket();

  const isAddingComments = useSelector((state) => state.room.isAddingComments);
  const [hovered, setHovered] = useState(false);
  const keywordThreads = useSelector(selectParentThreadsByKeyword(data._id));

  const selectedKeywordId = useSelector(
    (state) => state.selection.selectedKeywordId
  );
  const isClicked = selectedKeywordId ? selectedKeywordId === data._id : false;

  const kwBoard = useSelector((state) => selectBoardById(state, data.boardId));
  const isVoting = kwBoard?.isVoting;

  const image = useSelector((state) => selectImageById(state, data.imageId));

  const imageX = image?.x ?? 0;
  const imageY = image?.y ?? 0;
  const imageWidth = image?.width ?? 100; // Default width
  const imageHeight = image?.height ?? 100; // Default height

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stageRef.current && e.target === stageRef.current) {
        dispatch(setSelectedKeyword, null);
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
      dispatch(setSelectedKeyword, data._id);
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

    dispatch(updateKeyword, update);
    socket.emit(action, update);
  };

  const toggleSelected = (e) => {
    e.cancelBubble = true;
    const newIsSelected = !data.isSelected;
    const update = { id: data._id, changes: { isSelected: newIsSelected } };
    dispatch(updateKeyword, update);
    dispatch(
      newIsSelected ? addSelectedKeyword : removeSelectedKeyword,
      data._id
    );
    socket.emit("updateKeywordSelected", update);
  };

  const deleteKeyword = () => {
    try {
      if (!data.imageId) {
        socket.emit("deleteKeyword", {
          imageId: data.imageId,
          keywordId: data._id,
        });
      } else {
        dispatch(removeSelectedKeyword, data._id);
        dispatch(updateKeyword, {
          id: data._id,
          changes: {
            offsetX: undefined,
            offsetY: undefined,
            isSelected: false,
            votes: [],
            downvotes: [],
            author: "",
          },
        });
        socket.emit("removeKeywordFromBoard", data._id);
      }
    } catch (e) {
      console.log(e);
    }
  };

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
        keywordThreads={keywordThreads}
        handleThreadHover={handleThreadHover}
        handleThreadClick={handleThreadClick}
        setTooltipData={setTooltipData}
        isClicked={isClicked}
        deleteKeyword={deleteKeyword}
        author={data.author}
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
  keywordThreads,
  handleThreadHover,
  handleThreadClick,
  setTooltipData,
  isClicked,
  deleteKeyword,
  author,
}) => {
  const textRef = useRef();
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.width()); // Get actual text width
    }
  }, [text]);
  const [hovered, setHovered] = useState(false);

  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    // Delay hiding by 200ms
    hoverTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 750);
  };
  return (
    <Group>
      <Label
        name="hover-group"
        id={id}
        x={xpos}
        y={ypos}
        key={labelkey}
        onClick={onClick}
        draggable={draggable}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onMouseEnter={(e) => {
          onMouseEnter(e);
          handleMouseEnter();
        }}
        onMouseLeave={(e) => {
          onMouseLeave(e);
          handleMouseLeave();
        }}
      >
        <Tag
          name="label-tag"
          pointerDirection="left"
          fill={isSelected ? colorMapping[type] : "transparent"}
          strokeWidth={1}
          stroke={colorMapping[type]}
          cornerRadius={4}
          ref={keywordRef}
          shadowColor={
            isClicked
              ? colorMapping[type]
              : hovered
              ? colorMapping[type]
              : "transparent"
          }
          shadowBlur={isClicked ? 4 : hovered ? 3 : 0}
          shadowOpacity={isClicked ? 3 : hovered ? 2 : 0}
        />
        <Text
          ref={textRef}
          text={text}
          name="label-text"
          fontSize={14}
          lineHeight={1}
          padding={8}
          fill={isSelected ? "white" : colorMapping[type]}
          // width={Math.min(textWidth, 100)}        // set your desired max width in pixels
          wrap="char"
        />
      </Label>
      {hovered && (
        <>
          <Group
            onMouseEnter={(e) => {
              const container = e.target.getStage().container();
              container.style.cursor = "pointer";
              handleMouseEnter();
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage().container();
              container.style.cursor = "default";
              handleMouseLeave();
            }}
            onClick={deleteKeyword}
            name="hover-group"
            x={xpos + textWidth + 10}
            y={ypos - 20}
          >
            <Circle radius={7} fill={colorMapping[type]} />
            <Text
              ref={textRef}
              text={"x"}
              fontSize={14}
              fill="#fafafa"
              offsetX={10.5} // half the estimated width of the text
              offsetY={14} // half the height of the circle
              x={7} // center relative to circle
              y={7}
            />
          </Group>
          {author && (
            <Text
              x={xpos}
              y={ypos + 15}
              text={`by ${author}`}
              name="label-text"
              fontSize={12}
              lineHeight={1}
              padding={8}
              fill={"#999"}
              wrap="char"
            />
          )}
        </>
      )}
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
