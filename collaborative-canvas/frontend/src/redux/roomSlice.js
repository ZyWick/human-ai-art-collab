import { createSlice } from "@reduxjs/toolkit";

const roomReducer = createSlice({
  name: "socket",
  initialState: {
    roomId: null,
    roomName: null,
    currentBoardId: null,
    users: [],
    designDetails: {},
    designDetailsFull: {},
    isAddingComments: false,
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setIsAddingComments: (state, action) => {
      state.isAddingComments = action.payload;
    },
    setRoomName: (state, action) => {
      state.roomName = action.payload;
    },
    setCurrentBoardId: (state, action) => {
      state.currentBoardId = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setDesignDetails: (state, action) => {
      state.designDetails = action.payload;
    },
    setDesignDetailsFull: (state, action) => {
      state.designDetailsFull = action.payload;
    },
    updateDesignDetails: (state, action) => {
      state.designDetails = { ...state.designDetails, ...action.payload};
    },
    updateDesignDetailsFull: (state, action) => {
      state.designDetailsFull = { ...state.designDetails, ...action.payload};
    },
  },
});

export const {
  setRoomId,
  setRoomName,
  setCurrentBoardId,
  setUsers,
  setDesignDetails,
  setDesignDetailsFull,
  updateDesignDetails,
  updateDesignDetailsFull,
  setIsAddingComments,
} = roomReducer.actions;
export default roomReducer.reducer;
