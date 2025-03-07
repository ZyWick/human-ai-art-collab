import { createSlice } from "@reduxjs/toolkit";

const updateSingleKeyword = (existingKeywords, newKeyword) => {
    const keywordIndex = existingKeywords.findIndex((kw) => kw.word === newKeyword.word);
  
    if (keywordIndex !== -1) {
      // ✅ Update existing keyword attributes
      existingKeywords[keywordIndex] = { ...existingKeywords[keywordIndex], ...newKeyword };
      return [...existingKeywords];
    } else {
      // ✅ Add new keyword
      return [...existingKeywords, newKeyword];
    }
  };
  

const imageSlice = createSlice({
  name: "images",
  initialState: [],
  reducers: {
    setImages: (state, action) => action.payload,
    addImage: (state, action) => [...state, action.payload],
    removeImage: (state, action) => state.filter((img) => img._id !== action.payload),
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
                keywords: updateSingleKeyword(img.keywords, keyword), // ✅ Handle one keyword
              }
            : img
        );
      },
      
  },
});

export const { setImages, addImage, removeImage, updateImage, updateKeywords } = imageSlice.actions;
export default imageSlice.reducer;
