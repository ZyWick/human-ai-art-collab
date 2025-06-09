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
      const existingBoard = state.entities[id];
      if (existingBoard && !existingBoard.iterations.includes(iteration)) {
        existingBoard.iterations.push(iteration);
      }      
    },
    updateIterationPartial: (state, action) => {
      const { boardId, iterationId, prompt, imageUrl } = action.payload;
      const board = state.entities[boardId];
      if (!board || !board.iterations) return;

      const iteration = board.iterations.find(iter => iter._id === iterationId);
      if (!iteration) return;

      if (prompt !== undefined && !iteration.prompt.includes(prompt)) {
        iteration.prompt.push(prompt);
      }
      if (imageUrl !== undefined && !iteration.generatedImages.includes(imageUrl)) {
        iteration.generatedImages.push(imageUrl);
      }
    },
    
  },
});

export const { updateIterationPartial, setBoards, addBoard, updateBoard, updateBoardIterations, removeBoard  } = boardsSlice.actions;

// Selectors
export const {
  selectById: selectBoardById,
  selectAll: selectAllBoards,
} = boardsAdapter.getSelectors((state) => state.boards);

export default boardsSlice.reducer;
