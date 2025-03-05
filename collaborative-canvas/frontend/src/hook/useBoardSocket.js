import { useEffect } from 'react';

const useBoardSocket = (socket, username, roomID, setUsers, setImages) => {
  useEffect(() => {
    // Join the specified room
    socket.emit('joinRoom', { username, roomID });

    // Handle updates to room users
    const handleUpdateRoomUsers = (usersInRoom) => {
      const uniqueUsers = Array.from(new Map(usersInRoom.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);
    };

    // Handle loading of images
    const handleLoadImages = (roomImages) => setImages(roomImages);

    // Handle addition of a new image
    const handleNewImage = (img) => setImages((prev) => [...prev, img]);

    const handleRemoveImage = (_id) =>  setImages((prev) => prev.filter((img) => img._id !== _id));

    // Handle updates to existing images
    const handleUpdateImage = (updatedImage) => setImages((prev) =>
      prev.map((img) => (img.id === updatedImage.id ? updatedImage : img))
    );

    // Register event listeners
    socket.on('updateRoomUsers', handleUpdateRoomUsers);
    socket.on('loadImages', handleLoadImages);
    socket.on('newImage', handleNewImage);
    socket.on('deleteImage', handleRemoveImage);
    socket.on('updateImagePosition', handleUpdateImage);

    // Cleanup function to leave room and remove event listeners
    return () => {
      socket.emit('leave room', { username, roomID });
      socket.off('updateRoomUsers', handleUpdateRoomUsers);
      socket.off('loadImages', handleLoadImages);
      socket.off('newImage', handleNewImage);
      socket.off('updateImagePosition', handleUpdateImage);
    };
  }, [socket, username, roomID, setUsers, setImages]);
};

export default useBoardSocket;
