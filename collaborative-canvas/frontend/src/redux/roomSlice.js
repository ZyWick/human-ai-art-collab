import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

const REACT_APP_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(REACT_APP_BACKEND_URL);

const roomReducer = createSlice({
  name: "socket",
  initialState: {
    username: "Jeff",
    roomCode: "UJONZK",
    roomData: null,
    joined: false,
    users: [],
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setRoomCode: (state, action) => {
      state.roomCode = action.payload;
    },
    setRoomData: (state, action) => {
      state.roomData = action.payload;
    },
    setJoined: (state, action) => {
      state.joined = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsername, setRoomCode, setRoomData, setJoined, setUsers } =
roomReducer.actions;
export default roomReducer.reducer;
