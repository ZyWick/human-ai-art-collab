import { createSlice, createEntityAdapter, createSelector } from "@reduxjs/toolkit";

// Create an entity adapter for threads
const threadsAdapter = createEntityAdapter({
  selectId: (thread) => thread._id.toString(), // Ensure _id is used as the identifier
});

const threadsSlice = createSlice({
  name: "threads",
  initialState: threadsAdapter.getInitialState(),
  reducers: {
    setThreads: threadsAdapter.setAll,
    addThread: threadsAdapter.addOne, // Add a single thread
    addThreads: threadsAdapter.addMany, // Add multiple threads
    updateThread: threadsAdapter.updateOne, // Update a thread
    removeThread: threadsAdapter.removeOne, // Remove a thread by ID
  },
});

export const { setThreads, addThread, addThreads, updateThread, removeThread } = threadsSlice.actions;
export default threadsSlice.reducer;

// Selectors
export const {
  selectAll: selectAllThreads,
  selectById: selectThreadById,
  selectIds: selectThreadIds,
} = threadsAdapter.getSelectors((state) => state.threads);

const countChildren = (parentThreads, allThreads) => {
    return parentThreads.map((parent) => ({
      ...parent,
      childrenCount: allThreads.filter((child) => child.parentId === parent._id).length,
    }));
  };

// Function to populate children using a fast lookup object
const populateChildren = (parentThread, allThreads) => {
    const allThreadsById = Object.fromEntries(allThreads.map((t) => [t._id, t]));
  
    return {
      ...parentThread,
      children: allThreads
        .filter((child) => child.isResolved === false && child.parentId === parentThread._id) // Find children dynamically
        .map((child) => allThreadsById[child._id]), // Ensure full child objects
    };
  };

  export const selectPopulatedThreadById = (parentId) =>
    createSelector([selectAllThreads], (allThreads) => {
      const parentThread = allThreads.find((thread) => thread._id === parentId);
      return populateChildren(parentThread, allThreads);
    });
  

// ✅ Select threads that have NO imageId or keywordId (Board Threads)
export const selectBoardThreads = createSelector(
  [selectAllThreads],
  (allThreads) => {
    const boardThreads = allThreads.filter(
      (thread) => !thread.parentId && !thread.imageId && !thread.keywordId && !thread.isResolved
    );
    return countChildren(boardThreads, allThreads);
  }
);

export const selectParentThreadsByImage = (imageId) =>
    createSelector([selectAllThreads], (allThreads) => {
      const parentThreads = allThreads.filter(
        (thread) => thread.imageId === imageId && !thread.parentId && !thread.isResolved
      );
      return countChildren(parentThreads, allThreads);
    });
  
  // ✅ Select parent threads by keywordId and count children
  export const selectParentThreadsByKeyword = (keywordId) =>
    createSelector([selectAllThreads], (allThreads) => {
      const parentThreads = allThreads.filter(
        (thread) => thread.keywordId === keywordId && !thread.parentId && !thread.isResolved
      );
      return countChildren(parentThreads, allThreads);
    });