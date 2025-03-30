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
    updateBoardIterations: (state, action) => {
      const { id, iteration } = action.payload; // id = board ID, iteration = new object to push
      console.log({id, iteration})
      const existingBoard = state.entities[id];
      if (existingBoard && !existingBoard.iterations.includes(iteration)) {
        existingBoard.iterations.push(iteration);
      }      
    }
    
  },
});

export const { setBoards, addBoard, updateBoard, updateBoardIterations, removeBoard  } = boardsSlice.actions;

// Selectors
export const {
  selectById: selectBoardById,
  selectAll: selectAllBoards,
} = boardsAdapter.getSelectors((state) => state.boards);

export default boardsSlice.reducer;
