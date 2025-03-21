// selectionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedImageId: null,      // Only one image can be selected at a time
  selectedKeywordId: null,
  selectedKeywordIds: []      // An array to store multiple selected keyword IDs
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelectedImage(state, action) {
      state.selectedImageId = action.payload;
    },
    setSelectedKeyword(state, action) {
      state.selectedKeywordId = action.payload;
    },
    clearSelectedImage(state) {
      state.selectedImageId = null;
    },
    // Toggle a single keyword's selection
    toggleSelectedKeyword(state, action) {
      const keywordId = action.payload;
      if (state.selectedKeywordIds.includes(keywordId)) {
        state.selectedKeywordIds = state.selectedKeywordIds.filter(id => id !== keywordId);
      } else {
        state.selectedKeywordIds.push(keywordId);
      }
    },
    removeKeywordFromSelected(state, action) {
      state.selectedKeywordIds = state.selectedKeywordIds.filter(id => id !== action.payload);
    },
    // Set selected keywords to a new array (e.g., when loading selections)
    setSelectedKeywords(state, action) {
      state.selectedKeywordIds = action.payload;
    },
    clearSelectedKeywords(state) {
      state.selectedKeywordIds = [];
    }
  }
});

export const {
  setSelectedImage,
  setSelectedKeyword,
  clearSelectedImage,
  toggleSelectedKeyword,
  setSelectedKeywords,
  clearSelectedKeywords,
  removeKeywordFromSelected,
} = selectionSlice.actions;

export default selectionSlice.reducer;
