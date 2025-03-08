import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/socketSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
  updateKeywords,
} from "../redux/imageSlice";
import { useSocket } from "../components/SocketContext";

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const username = useSelector((state) => state.socket.username);
  const roomID = useSelector((state) => state.socket.roomData._id);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { username, roomID });

    socket.on("updateRoomUsers", (users) => dispatch(setUsers(users)));
    socket.on("loadImages", (images) => dispatch(setImages(images)));
    socket.on("newImage", (image) => dispatch(addImage(image)));
    socket.on("deleteImage", (id) => dispatch(removeImage(id)));
    socket.on("updateImage", (image) => dispatch(updateImage(image)));
    socket.on("updateKeywords", ({ imageId, newKeywords }) => {
      dispatch(updateKeywords({ imageId, newKeywords }));
    });

    return () => {
      socket.emit("leave room", { username, roomID });
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      socket.off("updateKeywords");
    };
  }, [socket, username, roomID, dispatch]);
};

export default useBoardSocket;
