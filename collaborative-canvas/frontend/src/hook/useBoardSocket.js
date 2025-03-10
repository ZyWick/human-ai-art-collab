import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/roomSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
} from "../redux/imagesSlice";
import { useSocket } from "../components/SocketContext";
import { toggleSelectedKeyword } from '../redux/selectionSlice'
import { updateBoardNoteKeywords, addBoardNoteKeyword, deleteBoardNoteKeywords } from "../redux/roomSlice";
import { setGeneratedImages, setCurrentBoardId } from '../redux/roomSlice'
import { removeBoardById, selectAllBoards  } from "../redux/boardsSlice";

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
   const { username, roomId, currentBoardId } = useSelector((state) => state.room);
  const boards = useSelector(selectAllBoards);

  useEffect(() => {
    if (!socket) return;

   
    const handleDeleteBoard = (deletedId) => {
      dispatch(removeBoardById(deletedId)); // Remove the board
    
      const remainingBoards = boards.filter(board => board._id !== deletedId);
      
      if (remainingBoards.length > 0) {
        const latestBoard = remainingBoards.reduce((latest, board) => 
          latest.updatedAt > board.updatedAt ? latest : board, remainingBoards[0]);
        
        if (deletedId === currentBoardId) {
          dispatch(setCurrentBoardId(latestBoard._id));
        }
      } 
    };
    

    socket.emit("joinRoom", { username, roomId });

    socket.on("updateRoomUsers", (users) => dispatch(setUsers(users)));
    socket.on("loadImages", (images) => dispatch(setImages(images)));
    
    socket.on("newImage", (image) => {
      console.log(image)
      console.log("heyy")
      if (image.boardId === currentBoardId) dispatch(addImage(image));
  });
  
  socket.on("deleteImage", (id) => {
      dispatch(removeImage(id));
  });
  
  socket.on("updateImage", (image) => {
    console.log(image.boardId, currentBoardId)
    console.log(image.boardId === currentBoardId)
      if (image.boardId === currentBoardId) dispatch(updateImage(image));
  });
  
  socket.on("newNoteKeyword", (newKw) => {
      if (newKw.boardId === currentBoardId) dispatch(addBoardNoteKeyword(newKw));
  });
  
  socket.on("updateKeywordNote", (newKw) => {
      if (newKw.boardId === currentBoardId) dispatch(updateBoardNoteKeywords(newKw));
  });
  
  socket.on("deleteNoteKeyword", (kwId) => {
      dispatch(deleteBoardNoteKeywords(kwId));
  });
  
  socket.on("toggleSelectedKeyword", (kwId) => {
      dispatch(toggleSelectedKeyword(kwId));
  });
  
  socket.on("generateNewImage", (newBoard) => {
      if (newBoard._id === currentBoardId) dispatch(setGeneratedImages(newBoard.generatedImages));
  });
  
  socket.on("cloneBoard", (newBoardId) => {
    console.log(newBoardId)
      dispatch(setCurrentBoardId(newBoardId));
  });
  
  socket.on("newBoard", (newBoardId) => {
      dispatch(setCurrentBoardId(newBoardId));
  });
  
  socket.on("deleteBoard", (deletedId) => {
      handleDeleteBoard(deletedId);
  });
  

    return () => {
      socket.emit("leave room", { username, roomId });
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      socket.off("newNoteKeyword");
      socket.off("updateKeywordNote");
      socket.off("deleteNoteKeyword");
      socket.off("toggleSelectedKeyword");
      socket.off("generateNewImage");
      socket.off("cloneBoard");
      socket.off("newBoard");
      socket.off("deleteBoard");
    };
  }, [socket, username, roomId, dispatch, currentBoardId, boards]);
};

export default useBoardSocket;
