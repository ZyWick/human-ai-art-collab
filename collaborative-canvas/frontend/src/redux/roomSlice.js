import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from '@reduxjs/toolkit';

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
    uploadProgressEs: [],
    imgGenProgressEs: [],
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
    setUploadProgress: (state, action) => {
      state.uploadProgressEs = action.payload;
    },
    // 1) create a new slot with both values
    addUploadProgress: (state, action) => {
      const { uploadId, fileName } = action.payload;
      state.uploadProgressEs.push({ uploadId, fileName, progress: 0 });
    },
    // 2) afterwards only ever update the progress
    updateUploadProgress: (state, action) => {
      const { uploadId, progress } = action.payload;
      const upload = state.uploadProgressEs.find(item => item.uploadId === uploadId);
      if (upload) {
        upload.progress = progress;
      }
    },
    // 3) remove an existing upload progress entry
    removeUploadProgress: (state, action) => {
      state.uploadProgressEs = state.uploadProgressEs.filter(item => item.uploadId !==  action.payload);
    },
    setImgGenProgress: (state, action) => {
      state.imgGenProgressEs = action.payload;
    },
    // 1) create a new slot with both values
    addImgGenProgress: (state, action) => {
      state.imgGenProgressEs.push({ boardId:  action.payload, progress: 0 });
    },
    // 2) afterwards only ever update the progress
    updateImgGenProgress: (state, action) => {
      const { boardId, progress } = action.payload;
      const upload = state.imgGenProgressEs.find(item => item.boardId === boardId);
      if (upload) {
        upload.progress = progress;
      }
    },
    // 3) remove an existing upload progress entry
    removeImgGenProgress: (state, action) => {
      state.imgGenProgressEs = state.imgGenProgressEs.filter(item => item.boardId !==  action.payload);
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

export const selectImgGenProgressEs = (state) => state.room.imgGenProgressEs;

// Selector to get item by ID
export const selectImgGenProgressByBoardId = (boardId) =>
  createSelector(
    [selectImgGenProgressEs],
    (items) => items.find((item) => item.boardId === boardId)
  );

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
  setUploadProgress,
  addUploadProgress,
  updateUploadProgress,
  removeUploadProgress,
  setImgGenProgress,
  addImgGenProgress,
  updateImgGenProgress,
  removeImgGenProgress,
} = roomReducer.actions;
export default roomReducer.reducer;
