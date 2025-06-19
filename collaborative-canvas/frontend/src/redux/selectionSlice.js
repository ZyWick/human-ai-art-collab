// selectionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedImageId: null, // Only one image can be selected at a time
  selectedKeywordId: null,
  selectedKeywordIds: [], // An array to store multiple selected keyword IDs
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setSelectedImage(state, action) {
      state.selectedImageId = action.payload;
    },
    setSelectedKeyword(state, action) {
      state.selectedKeywordId = action.payload;
    },
    // Set selected keywords to a new array (e.g., when loading selections)
    setSelectedKeywords(state, action) {
      state.selectedKeywordIds = action.payload;
    },
    addSelectedKeyword(state, action) {
      const keywordId = action.payload;
      if (!state.selectedKeywordIds.includes(keywordId))
        state.selectedKeywordIds.push(keywordId);
    },
    removeSelectedKeyword(state, action) {
      state.selectedKeywordIds = state.selectedKeywordIds.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedKeywords(state) {
      state.selectedKeywordIds = [];
    },
  },
});

export const {
  setSelectedImage,
  setSelectedKeyword,
  clearSelectedImage,
  toggleSelectedKeyword,
  addSelectedKeyword,
  removeSelectedKeyword, // Fixed export
  setSelectedKeywords,
  clearSelectedKeywords,
} = selectionSlice.actions;

export default selectionSlice.reducer;
