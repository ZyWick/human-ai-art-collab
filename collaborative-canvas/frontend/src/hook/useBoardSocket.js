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

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const username = useSelector((state) => state.room.username);
  const roomID = useSelector((state) => state.room.roomId);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { username, roomID });

    socket.on("updateRoomUsers", (users) => dispatch(setUsers(users)));
    socket.on("loadImages", (images) => dispatch(setImages(images)));
    socket.on("newImage", (image) => dispatch(addImage(image)));
    socket.on("deleteImage", (id) => dispatch(removeImage(id)));
    socket.on("updateImage", (image) => 
      dispatch(updateImage(image)));
    // socket.on("updateKeywords", ({ imageId, newKeywords }) => {
    //   dispatch(updateKeywords({ imageId, newKeywords }));
    // });
    socket.on("newNoteKeyword", (newKw) => dispatch(addBoardNoteKeyword(newKw)));
    socket.on("updateKeywordNote", (newKw) => dispatch(updateBoardNoteKeywords(newKw)));
    socket.on("deleteNoteKeyword", (kwId) => dispatch(deleteBoardNoteKeywords(kwId)));
    socket.on("toggleSelectedKeyword", (kwId) => dispatch(toggleSelectedKeyword(kwId)))
    return () => {
      socket.emit("leave room", { username, roomID });
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      // socket.off("updateKeywords");
      socket.off("newNoteKeyword");
      socket.off("updateKeywordNote");
      socket.off("deleteNoteKeyword");
    };
  }, [socket, username, roomID, dispatch]);
};

export default useBoardSocket;
