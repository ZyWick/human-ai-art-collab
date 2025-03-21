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
    clearAllVotes: (state) => {
      Object.values(state.entities).forEach((keyword) => {
        if (keyword) {
          keyword.votes = [];
          keyword.downvotes = []; // Clear downvotes as well
        }
      });
    },    
    resetKeywords: (state) => {
      keywordsAdapter.removeAll(state);
    },
    
    addChildToThread: (state, action) => {
      const { boardId, parentId, newThread } = action.payload;

      return state.map((kw) => {
        if (kw.boardId === boardId) {
          return {
            ...kw,
            parentThreads: kw.parentThreads.map((thread) => {
              if (thread._id === parentId) {
                return {
                  ...thread,
                  children: [...thread.children, newThread],
                };
              }
              return thread;
            }),
          };
        }
        return kw;
      });
    },
    addThreadToKeyword: (state, action) => {
      const { boardId, newThread } = action.payload;

      return state.map((kw) => {
        if (kw.boardId === boardId) {
          return {
            ...kw,
            parentThreads: [...kw.parentThreads, newThread],
          };
        }
        return kw;
      });
    },
  },
});

export const {
  clearAllVotes,
  addKeyword,
  addKeywords,
  updateKeyword,
  removeKeyword,
  removeKeywords,
  addKeywordsFromImages,
  resetKeywords
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
