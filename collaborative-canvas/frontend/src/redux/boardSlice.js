// boardsSlice.js
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// Create an adapter for boards
const boardsAdapter = createEntityAdapter({
    selectId: (board) => board._id.toString(), // use toString() if you need a string
  });

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

// In boardsSlice.js, you can also export selectAll
export const {
  selectById: selectBoardById,
  selectAll: selectAllBoards,
} = boardsAdapter.getSelectors((state) => state.boards);


export default boardsSlice.reducer;
