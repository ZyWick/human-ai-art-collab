import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/roomSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
  updateKeywords,
} from "../redux/imagesSlice";
import { useSocket } from "../components/SocketContext";
import { toggleSelectedKeyword } from '../redux/selectionSlice'
import { updateBoardNoteKeywords, addBoardNoteKeyword, deleteBoardNoteKeywords } from "../redux/roomSlice";
import { setGeneratedImages, setCurrentBoardId } from '../redux/roomSlice'
import { removeBoardById, selectAllBoards  } from "../redux/boardsSlice";

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  // const username = useSelector((state) => state.room.username);
  // const roomID = useSelector((state) => state.room.roomId);
  // const currentBoardId = useSelector((state) => state.room.currentBoardId);
  const { username, roomId, currentBoardId } = useSelector((state) => state.room);
  console.log({ username, roomId, currentBoardId })
  const boards = useSelector(selectAllBoards);

  const handleDeleteBoard = (deletedId) => {
    dispatch(removeBoardById(deletedId)); // Remove the board
    const latestBoard = boards.reduce((latest, board) => 
      latest.updatedAt > board.updatedAt ? latest : board, boards[0]);
    const latestBoardID = latestBoard ? latestBoard._id : null;
  
    if (deletedId === currentBoardId) {
      dispatch(setCurrentBoardId(latestBoardID)); // Set the current board to the latest one
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { username, roomId });

    socket.on("updateRoomUsers", (users) => dispatch(setUsers(users)));
    socket.on("loadImages", (images) => dispatch(setImages(images)));
    socket.on("newImage", (image) => dispatch(addImage(image)));
    socket.on("deleteImage", (id) => dispatch(removeImage(id)));
    socket.on("updateImage", (image) => dispatch(updateImage(image)));
    // socket.on("updateKeywords", ({ imageId, newKeywords }) => {
    //   dispatch(updateKeywords({ imageId, newKeywords }));
    // });
    socket.on("newNoteKeyword", (newKw) => dispatch(addBoardNoteKeyword(newKw)));
    socket.on("updateKeywordNote", (newKw) => dispatch(updateBoardNoteKeywords(newKw)));
    socket.on("deleteNoteKeyword", (kwId) => dispatch(deleteBoardNoteKeywords(kwId)));
    socket.on("toggleSelectedKeyword", (kwId) => dispatch(toggleSelectedKeyword(kwId)))
    socket.on("generateNewImage", (imgUrls) => dispatch(setGeneratedImages(imgUrls)))
    socket.on("cloneBoard", (newBoardId) =>dispatch(setCurrentBoardId(newBoardId)))
    socket.on("newBoard", (newBoardId) => dispatch(setCurrentBoardId(newBoardId)))
    socket.on("deleteBoard", (deletedId) => handleDeleteBoard(deletedId))
    

    return () => {
      socket.emit("leave room", { username, roomId });
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      // socket.off("updateKeywords");
      socket.off("newNoteKeyword");
      socket.off("updateKeywordNote");
      socket.off("deleteNoteKeyword");
      socket.off("toggleSelectedKeyword");
      socket.off("generateNewImage");
      socket.off("cloneBoard");
      socket.off("newBoard");
      socket.off("deleteBoard");
    };
  }, [socket, username, roomId, dispatch]);
};

export default useBoardSocket;
