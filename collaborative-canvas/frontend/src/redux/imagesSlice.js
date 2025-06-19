import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const imagesAdapter = createEntityAdapter({
  selectId: (image) => image._id.toString(), // Ensures ID is treated as a string
});

const initialState = imagesAdapter.getInitialState();

const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    setImages: imagesAdapter.setAll,
    addImage: imagesAdapter.addOne,
    removeImage: imagesAdapter.removeOne,
    updateImage: imagesAdapter.updateOne,
    addKeywordToImage: (state, action) => {
      const { imageId, keywordId } = action.payload;
      const image = state.entities[imageId];
      if (image && !image.keywords.includes(keywordId)) {
        image.keywords.push(keywordId);
      }
    },
    removeKeywordFromImage: (state, action) => {
      const { imageId, keywordId } = action.payload;
      const image = state.entities[imageId];
      if (image) {
        image.keywords = image.keywords.filter((id) => id !== keywordId);
      }
    },
  },
});

export const { selectAll: selectAllImages, selectById: selectImageById } =
  imagesAdapter.getSelectors((state) => state.images);

export const {
  setImages,
  addImage,
  removeImage,
  updateImage,
  addKeywordToImage,
  removeKeywordFromImage,
} = imagesSlice.actions;
export default imagesSlice.reducer;
