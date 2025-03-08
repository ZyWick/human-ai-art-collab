import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from '@reduxjs/toolkit';

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
        img._id === action.payload._id ? { ...img, ...action.payload } : img
      );
    },
  },
});

const selectImages = (state) => state.images;

export const selectImageById = createSelector(
  [selectImages, (state, imageId) => imageId],
  (images, imageId) => images.find((image) => image._id === imageId)
);

export const { setImages, addImage, removeImage, updateImage } =
imagesSlice.actions;
export default imagesSlice.reducer;
