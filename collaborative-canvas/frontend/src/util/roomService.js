import { joinRoom as apiJoinRoom, createRoom as apiCreateRoom } from "./api";
// import { setUsername, setRoomCode } from "./redux/roomSlice";
import {
  setRoomId,
  setRoomName,
  setCurrentBoardId,
  setDesignDetails,
  setDesignDetailsFull,
  setIsAddingComments,
  setUploadProgress,
  setImgGenProgress,
} from "../redux/roomSlice";
import { setBoards } from "../redux/boardsSlice";

const initiateRoom = (roomData, dispatch, navigate) => {
  if (!roomData) return;

  const { _id, name, boards, designDetails } = roomData;
  dispatch(setRoomId(_id));
  dispatch(setRoomName(name));
  dispatch(setIsAddingComments(false));
  dispatch(setUploadProgress([]));
  dispatch(setImgGenProgress([]));
  dispatch(setBoards(boards));
  dispatch(setCurrentBoardId(boards?.[boards.length - 1]?._id));
  dispatch(setDesignDetails(designDetails));
  dispatch(setDesignDetailsFull(designDetails));

  navigate(`/room/${roomData.joinCode}`);
};

export const joinRoomService = async (roomCode, dispatch, navigate) => {
  try {
    const newRoomData = await apiJoinRoom(roomCode);
    initiateRoom(newRoomData, dispatch, navigate);
  } catch (error) {
    console.error("Failed to join room:", error);
  }
};

export const createRoomService = async (roomCode, dispatch, navigate) => {
  try {
    const newRoomData = await apiCreateRoom(roomCode);
    initiateRoom(newRoomData, dispatch, navigate);
    alert("Room created successfully!");
  } catch (error) {
    console.error("Failed to create room:", error);
  }
};
