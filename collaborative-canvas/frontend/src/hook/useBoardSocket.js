import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../store/socketSlice";
import { setImages, addImage, removeImage, updateImage, updateKeywords } from "../store/imageSlice";

const useBoardSocket = (username, roomID) => {
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { username, roomID });

    socket.on("updateRoomUsers", (users) => dispatch(setUsers(users)));
    socket.on("loadImages", (images) => dispatch(setImages(images)));
    socket.on("newImage", (image) => dispatch(addImage(image)));
    socket.on("deleteImage", (id) => dispatch(removeImage(id)));
    socket.on("updateImage", (image) => dispatch(updateImage(image)));

    // ✅ Listen for keyword updates
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



// import { useEffect } from "react";

// const useBoardSocket = (socket, username, roomID, setUsers, setImages) => {
//   useEffect(() => {
//     // Join the specified room
//     socket.emit("joinRoom", { username, roomID });

//     // Handle updates to room users
//     const handleUpdateRoomUsers = (usersInRoom) => {
//       const uniqueUsers = Array.from(
//         new Map(usersInRoom.map((user) => [user.id, user])).values()
//       );
//       setUsers(uniqueUsers);
//     };

//     // Handle loading of images
//     const handleLoadImages = (roomImages) => setImages(roomImages);

//     // Handle addition of a new image
//     const handleNewImage = (img) => setImages((prev) => [...prev, img]);

//     const handleRemoveImage = (_id) =>
//       setImages((prev) => prev.filter((img) => img._id !== _id));

//     // Handle updates to existing images
//     const handleUpdateImage = (updatedImage) => 
//       setImages((prev) =>
//         prev.map((img) => (img._id === updatedImage._id ? updatedImage : img))
//       );

//       const handleError = (message) => {
//         console.error("Socket Error:", message); // Log the error
//         alert(message); // Show an alert to the user (optional)
//       };

//     // Register event listeners
//     socket.on("updateRoomUsers", handleUpdateRoomUsers);
//     socket.on("loadImages", handleLoadImages);
//     socket.on("newImage", handleNewImage);
//     socket.on("deleteImage", handleRemoveImage);
//     socket.on("updateImage", handleUpdateImage);
//     socket.on("error", (error) => handleError(error.message));

//     // Cleanup function to leave room and remove event listeners
//     return () => {
//       socket.emit("leave room", { username, roomID });
//       socket.off("updateRoomUsers", handleUpdateRoomUsers);
//       socket.off("loadImages", handleLoadImages);
//       socket.off("newImage", handleNewImage);
//       socket.off("updateImagePosition", handleUpdateImage);
//     };
//   }, [socket, username, roomID, setUsers, setImages]);
// };

// export default useBoardSocket;
