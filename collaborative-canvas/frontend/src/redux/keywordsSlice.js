import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";

const keywordsAdapter = createEntityAdapter({
  selectId: (keyword) => keyword._id.toString(),
});

const keywordsSlice = createSlice({
  name: "keywords",
  initialState: keywordsAdapter.getInitialState(),
  reducers: {
    setKeywords: keywordsAdapter.setAll,
    addKeyword: keywordsAdapter.addOne,
    addKeywords: keywordsAdapter.addMany,
    updateKeyword: keywordsAdapter.updateOne,
    removeKeyword: keywordsAdapter.removeOne,
    removeKeywords: keywordsAdapter.removeMany,
    addKeywordsFromImages: (state, action) => {
      const keywordsMap = new Map();
      action.payload.forEach((image) => {
        image.keywords.forEach((keyword) => {
          keywordsMap.set(keyword._id.toString(), keyword);
        });
      });
      const keywordsArray = Array.from(keywordsMap.values());
      keywordsAdapter.addMany(state, keywordsArray);
    },
    clearAllVotes: (state, action) => {
      Object.values(state.entities).forEach((keyword) => {
        if (keyword.boardId === action.payload) {
          keyword.votes = [];
          keyword.downvotes = []; // Clear downvotes as well
        }
      });
    },    
  },
});

export const {
  setKeywords,
  clearAllVotes,
  addKeyword,
  addKeywords,
  updateKeyword,
  removeKeyword,
  removeKeywords,
  addKeywordsFromImages,
} = keywordsSlice.actions;

export const keywordsSelectors = keywordsAdapter.getSelectors(
  (state) => state.keywords
);
export const selectAllKeywords = (state) => keywordsSelectors.selectAll(state);
export const selectKeywordById = (state, id) =>
  keywordsSelectors.selectById(state, id);
export const selectKeywordsByImage = createSelector(
  [selectAllKeywords, (_, image) => image?.keywords || []],
  (allKeywords, keywordIds) =>
    allKeywords.filter((keyword) => keywordIds.includes(keyword._id))
);

export default keywordsSlice.reducer;
