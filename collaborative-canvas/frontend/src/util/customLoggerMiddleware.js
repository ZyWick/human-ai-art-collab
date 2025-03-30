export const keywordLoggerMiddleware = (store) => (next) => (action) => {
    if (action.type === "keywords/updateKeyword") {
      const state = store.getState();
      const { id, changes } = action.payload;
      const keyword = state.keywords.entities[id];
  
      if (keyword) {
        const hasVotesChanged =
          changes.votes !== undefined && JSON.stringify(changes.votes) !== JSON.stringify(keyword.votes);
        const hasDownvotesChanged =
          changes.downvotes !== undefined && JSON.stringify(changes.downvotes) !== JSON.stringify(keyword.downvotes);
  
        if (hasVotesChanged || hasDownvotesChanged) {
          const historyEntry = {
            timestamp: new Date().toISOString(),
            votes: hasVotesChanged ? changes.votes : keyword.votes,
            downvotes: hasDownvotesChanged ? changes.downvotes : keyword.downvotes,
          };
  
          const updatedAction = {
            ...action,
            payload: {
              ...action.payload,
              changes: {
                ...changes,
                history: keyword.history ? [...keyword.history, historyEntry] : [historyEntry],
              },
            },
          };
  
          return next(updatedAction);
        }
      }
    }
  
    return next(action);
  };

const customLoggerMiddleware = (store) => (next) => (action) => {
    const prevState = store.getState();
    const result = next(action); // Proceed with action
    const nextState = store.getState();
  
    // Extract relevant parts of the state
    const extractRelevantState = (state) => ({
      keywords: {
        isSelected: state.keywords.isSelected,
        votes: state.keywords.votes,
        downvotes: state.keywords.downvotes,
      },
      threads: {
        value: state.threads.value,
        isResolved: state.threads.isResolved,
      },
      room: state.room,
      board: state.board,
      selection: { selectedKeywordIds: state.selection.selectedKeywordIds },
    });
  
    const prevRelevantState = extractRelevantState(prevState);
    const nextRelevantState = extractRelevantState(nextState);
  
    // Find changes in state with previous values
    const findStateChanges = (prev, next) => {
      const changes = {};
      Object.keys(next).forEach((key) => {
        if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
          changes[key] = { previous: prev[key], next: next[key] };
        }
      });
      return changes;
    };
  
    const stateChanges = findStateChanges(prevRelevantState, nextRelevantState);
  
    // Track entity additions/removals
    const entityActions = {
      "boards/addBoard": "Board Added",
      "boards/removeBoard": "Board Removed",
      "keywords/addKeyword": "Keyword Added",
      "keywords/removeKeyword": "Keyword Removed",
      "images/addImage": "Image Added",
      "images/removeImage": "Image Removed",
      "threads/addThread": "Thread Added",
    };
  
    const entityActionMessage = entityActions[action.type];
  
    if (Object.keys(stateChanges).length > 0 || entityActionMessage) {
      console.group(`Action: ${action.type}`);
      console.info("Dispatching", action);
  
      if (entityActionMessage) {
        console.log(`🔹 ${entityActionMessage}`);
      }
      
      if(Object.keys(stateChanges).length > 0)
      console.log("State Changes:", stateChanges);
      console.groupEnd();
    }
  
    return result;
  };
  
  export default customLoggerMiddleware;
  