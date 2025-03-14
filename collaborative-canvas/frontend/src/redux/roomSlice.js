import { createSlice } from "@reduxjs/toolkit";

const roomReducer = createSlice({
  name: "socket",
  initialState: {
    roomId: null,
    roomName: null,
    currentBoardId: null,
    boardNoteKeywords: [],
    users: [],
    roomChat: [],
    designDetails: {},
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setRoomName: (state, action) => {
      state.roomName = action.payload;
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
    setDesignDetails: (state, action) => {
      state.designDetails = action.payload;
    },
    updateDesignDetails: (state, action) => {
      state.designDetails = { ...state.designDetails, ...action.payload};
    },
    setRoomChat: (state, action) => {
      state.roomChat = action.payload;
    },
    addRoomChatMessage: (state, action) => {
      state.roomChat.push(action.payload);
    },
    clearAllNoteKeywordVotes: (state) => {
      state.boardNoteKeywords = state.boardNoteKeywords.map(keyword => ({
        ...keyword,
        votes: [] // Clear votes for all keywords
      }));
    }
  },
});

export const {
  setRoomId,
  setRoomName,
  setCurrentBoardId,
  setBoardNoteKeywords,
  updateBoardNoteKeywords,
  addBoardNoteKeyword,
  deleteBoardNoteKeywords,
  setUsers,
  setDesignDetails,
  updateDesignDetails,
  setRoomChat,
  addRoomChatMessage,
  clearAllNoteKeywordVotes
} = roomReducer.actions;
export default roomReducer.reducer;
