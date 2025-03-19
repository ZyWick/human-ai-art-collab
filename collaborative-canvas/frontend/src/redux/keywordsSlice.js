import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const keywordsAdapter = createEntityAdapter({
    selectId: (keyword) => keyword._id.toString(),
});

const keywordsSlice = createSlice({
    name: 'keywords',
    initialState: keywordsAdapter.getInitialState(),
    reducers: {
        addKeyword: keywordsAdapter.addOne,
        addKeywords: keywordsAdapter.addMany,
        updateKeyword: keywordsAdapter.updateOne,
        removeKeyword: keywordsAdapter.removeOne,
        removeKeywords: keywordsAdapter.removeMany,
    },
});

export const { addKeyword, addKeywords, updateKeyword, removeKeyword, removeKeywords } = keywordsSlice.actions;
export const keywordsSelectors = keywordsAdapter.getSelectors((state) => state.keywords);
export default keywordsSlice.reducer;
