import React, { useRef, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import ImageComponent from "./ImageComponent";
import useWindowSize from "../hook/useWindowSize";
import { useSelector, useDispatch } from "react-redux";
import KeywordComponent from "./KeywordComponent";
import {updateBoardNoteKeywords, deleteBoardNoteKeywords} from '../redux/roomSlice'
import { useSocket } from "./SocketContext";
import { toggleSelectedKeyword } from "../redux/selectionSlice";
import { deleteKeyword } from "../util/api";

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
    socket.emit("toggleSelectedKeyword", data._id)
    dispatch(updateBoardNoteKeywords(newKw))
  }

  const deleteNoteKeyword = async(keyword) => {
    try {
      socket.emit("deleteNoteKeyword", keyword._id)
      const result = await deleteKeyword(keyword._id)
    } catch (e) {
      console.log(e)
    }
  }

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const scaleBy = 1.05; // Zoom sensitivity
    const oldScale = stage.scaleX();
    
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  
    // Adjust scale based on wheel direction
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  
    stage.scale({ x: newScale, y: newScale });
  
    // Keep the zoom centered around the mouse pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
  
    stage.position(newPos);
    stage.batchDraw(); // Optimize drawing performance
  };
  
  return (
    <Stage
      width={windowSize.width}
      height={windowSize.height}
      ref={stageRef}
      onWheel={handleWheel} // Enable zooming with mouse wheel
      draggable // Optional: Allow panning
    >
      <Layer>
        {images &&
          images.map((img) => (
            <ImageComponent key={img._id} imgData={img} stageRef={stageRef} />
          ))}
        {noteKeywords &&
          noteKeywords.map((kw) => (
            <KeywordComponent
              key={kw._id}
              data={kw}
              imageBounds={{ x: 0, y: 0 }}
              handleKeywordDrag={handleKeywordDrag}
              toggleSelected={toggleSelected}
              deleteKeyword={deleteNoteKeyword}
            />
          ))}
      </Layer>
    </Stage>
  );
};

export default Moodboard;
