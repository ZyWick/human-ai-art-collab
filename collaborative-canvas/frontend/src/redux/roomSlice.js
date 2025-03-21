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
    isAddingComments: false,
    boardThreads: [],
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setIsAddingComments: (state, action) => {
      state.isAddingComments = action.payload;
    },
    setBoardThreads:  (state, action) => {
      state.boardThreads = action.payload;
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
  setUsers,
  setDesignDetails,
  updateDesignDetails,
  setRoomChat,
  addRoomChatMessage,
  clearAllNoteKeywordVotes,
  setIsAddingComments,
  setBoardThreads
} = roomReducer.actions;
export default roomReducer.reducer;
