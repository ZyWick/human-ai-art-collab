import { createSlice } from "@reduxjs/toolkit";

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

const imageSlice = createSlice({
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

export const { setImages, addImage, removeImage, updateImage, updateKeywords } =
  imageSlice.actions;
export default imageSlice.reducer;
