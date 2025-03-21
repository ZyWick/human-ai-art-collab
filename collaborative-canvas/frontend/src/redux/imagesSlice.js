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
    addKeywordToImage: (state, action) => {
      const { imageId, keywordId } = action.payload;
      const image = state.find((img) => img._id === imageId);
      if (image && !image.keywords.includes(keywordId)) {
        image.keywords.push(keywordId); // ✅ Add only if not already present
      }
    },
    removeKeywordFromImage: (state, action) => {
      const { imageId, keywordId } = action.payload;
      const image = state.find((img) => img._id === imageId);
      if (image) {
        image.keywords = image.keywords.filter(id => id !== keywordId); // ✅ Remove keywordId
      }
    },
    addThreadToImage: (state, action) => {
      const { imageId, newThread } = action.payload;
    
      return state.map((image) => {
        if (image._id !== imageId) return image; // Skip unrelated images
    
        // If `newThread` is a root thread (no parentId), add it to parentThreads
        if (!newThread.parentId) {
          return {
            ...image,
            parentThreads: [...(image.parentThreads || []), newThread],
          };
        }
    
        // If `newThread` is a child thread, add it to the correct parent's children
        return {
          ...image,
          parentThreads: (image.parentThreads || []).map((thread) =>
            thread._id === newThread.parentId
              ? {
                  ...thread,
                  children: [...(thread.children || []), newThread], // Ensure `children` exists
                }
              : thread
          ),
        };
      });
    },    
  },
});

const selectImages = (state) => state.images;

export const selectImageById = createSelector(
  [selectImages, (state, imageId) => imageId],
  (images, imageId) => images.find((image) => image._id === imageId)
);

export const { addThreadToImage, addKeywordToImage, removeKeywordFromImage, setImages, addImage, removeImage, updateImage} =
imagesSlice.actions;
export default imagesSlice.reducer;
