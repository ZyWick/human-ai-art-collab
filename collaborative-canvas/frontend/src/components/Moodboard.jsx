import React, { useRef, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";
import { useSelector, useDispatch } from "react-redux";
import KeywordComponent from "./KeywordComponent";
import {updateBoardNoteKeywords} from '../redux/roomSlice'
import { useSocket } from "./SocketContext";
import { toggleSelectedKeyword } from "../redux/selectionSlice";


const Moodboard = () => {
  const stageRef = useRef(null);
  const windowSize = useWindowSize();
  const dispatch = useDispatch();
  const socket = useSocket();
  const images = useSelector((state) => state.images);
  const noteKeywords = useSelector((state) => state.room.boardNoteKeywords);

  const handleKeywordDrag = (e, action, keyword) => {
      e.cancelBubble = true;
      const noteAction = action + "Note";
      const newKeyword = {
        ...keyword,
        offsetX: e.target.x(),
        offsetY: e.target.y(),
      };
      socket.emit(noteAction, newKeyword);
      dispatch(updateBoardNoteKeywords(newKeyword));
    };

  const toggleSelected = (data) => {
    const newKw = {...data, isSelected: !data.isSelected}
    socket.emit("updateKeywordNote", newKw)
    dispatch(toggleSelectedKeyword(data._id))
    dispatch(updateBoardNoteKeywords(newKw))
  }

  return (
    <Stage width={windowSize.width} height={windowSize.height} ref={stageRef}>
      <Layer>
        {images &&
          images.map((img) => (
            <ImageComponent key={img._id} imgData={img} stageRef={stageRef} />
          ))}
        {noteKeywords &&
          noteKeywords.map((kw) => (
            <KeywordComponent key={kw._id}
              data={kw}
              imageBounds={{ x: 0, y: 0}}
              handleKeywordDrag={handleKeywordDrag} 
              toggleSelected={toggleSelected}/>
          ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
