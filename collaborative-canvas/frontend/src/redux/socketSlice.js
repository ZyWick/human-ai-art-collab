import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(REACT_APP_BACKEND_URL);

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket: socket,
    users: [],
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = socketSlice.actions;
export default socketSlice.reducer;
