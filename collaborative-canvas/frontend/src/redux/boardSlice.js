// boardsSlice.js
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// Create an adapter for boards
const boardsAdapter = createEntityAdapter();

// Initial state for boards
const initialState = boardsAdapter.getInitialState();

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: boardsAdapter.setAll,
    addBoard: boardsAdapter.addOne,
    updateBoard: boardsAdapter.updateOne,
    removeBoard: boardsAdapter.removeOne,
  },
});

export const { setBoards, addBoard, updateBoard, removeBoard } = boardsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllBoards,
  selectById: selectBoardById,
} = boardsAdapter.getSelectors((state) => state.boards);

export default boardsSlice.reducer;
