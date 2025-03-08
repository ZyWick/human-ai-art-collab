import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from '@reduxjs/toolkit';

const updateSingleKeyword = (existingKeywords, newKeyword) => {
  const keywordIndex = existingKeywords.findIndex(
    (kw) => kw.word === newKeyword.word
  );

  if (keywordIndex !== -1) {
    // ✅ Create a new array instead of mutating
    return existingKeywords.map((kw, idx) =>
      idx === keywordIndex ? { ...kw, ...newKeyword } : kw
    );
  } else {
    // ✅ Return a new array with the new keyword added
    return [...existingKeywords, newKeyword];
  }
};

const imagesSlice = createSlice({
  name: "images",
  initialState: [],
  reducers: {
    setImages: (state, action) => action.payload,
    addImage: (state, action) => [...state, action.payload],
    removeImage: (state, action) =>
      state.filter((img) => img._id !== action.payload),
    updateImage: (state, action) => {
      return state.map((img) =>
        img._id === action.payload._id ? action.payload : img
      );
    },
    updateKeywords: (state, action) => {
      const { imageId, keyword } = action.payload;

      return state.map((img) =>
        img._id === imageId
          ? {
              ...img,
              keywords: updateSingleKeyword([...img.keywords], keyword), // Ensure a new array is passed
            }
          : img
      );
    },
  },
});

const selectImages = (state) => state.images;

export const selectImageById = createSelector(
  [selectImages, (state, imageId) => imageId],
  (images, imageId) => images.find((image) => image._id === imageId)
);

export const { setImages, addImage, removeImage, updateImage, updateKeywords } =
imagesSlice.actions;
export default imagesSlice.reducer;
