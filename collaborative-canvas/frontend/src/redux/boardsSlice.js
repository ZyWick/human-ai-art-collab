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
    removeBoardById: (state, action) => {
      boardsAdapter.removeOne(state, action.payload); // action.payload should be the board ID
    },
    addThreadToBoard: (state, action) => {
      const { boardId, newThread } = action.payload;
      console.log("asd")
      console.log({ boardId, newThread })
      const board = state.entities[boardId];

      if (board) {
        board.parentThreads = [...(board.parentThreads || []), newThread];
      }
    },
  },
});

export const { addThreadToBoard, setBoards, addBoard, updateBoard, removeBoard, removeBoardById  } = boardsSlice.actions;

// Selectors
export const {
  selectById: selectBoardById,
  selectAll: selectAllBoards,
} = boardsAdapter.getSelectors((state) => state.boards);

export default boardsSlice.reducer;
