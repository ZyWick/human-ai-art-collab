import { createSlice } from "@reduxjs/toolkit";

const roomReducer = createSlice({
  name: "socket",
  initialState: {
    username: "Jeff",
    roomId: null,
    roomCode: "UJONZK",
    roomName: null,
    updatedAt: null,
    currentBoardId: null,
    boardNoteKeywords: [],
    users: [],
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setRoomCode: (state, action) => {
      state.roomCode = action.payload;
    },
    setRoomName: (state, action) => {
      state.roomName = action.payload;
    },
    setUpdatedAt: (state, action) => {
      state.updatedAt = action.payload;
    },
    setCurrentBoardId: (state, action) => {
      state.currentBoardId = action.payload;
    },
    setBoardNoteKeywords: (state, action) => {
      state.boardNoteKeywords = action.payload;
    },
    updateBoardNoteKeywords: (state, action) => {
      state.boardNoteKeywords = state.boardNoteKeywords.map((kw) =>
        kw._id === action.payload._id ? action.payload : kw
      );
    },
    addBoardNoteKeyword: (state, action) => {
      state.boardNoteKeywords.push(action.payload);
    },
    deleteBoardNoteKeywords: (state, action) => {
      state.boardNoteKeywords = state.boardNoteKeywords.filter(
        (kw) => kw._id !== action.payload
      );
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const {
  setUsername,
  setRoomId,
  setRoomCode,
  setRoomName,
  setUpdatedAt,
  setCurrentBoardId,
  setBoardNoteKeywords,
  updateBoardNoteKeywords,
  addBoardNoteKeyword,
  deleteBoardNoteKeywords,
  setUsers,
} = roomReducer.actions;
export default roomReducer.reducer;
