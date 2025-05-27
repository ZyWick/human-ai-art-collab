import _ from 'lodash';

export function checkMeaningfulChanges(prev, curr) {
      const prevKeys = Object.keys(prev);
      const currKeys = Object.keys(curr);

      if (prevKeys.length !== currKeys.length) return true;

      for (const key of new Set([...prevKeys, ...currKeys])) {
        const prevVal = prev[key];
        const currVal = curr[key];

        if (typeof prevVal !== "object" || typeof currVal !== "object") {
          if (prevVal !== currVal) return true;
        } else {
          const subKeysPrev = Object.keys(prevVal);
          const subKeysCurr = Object.keys(currVal);

          if (subKeysPrev.length !== subKeysCurr.length) return true;

          for (const subKey of new Set([...subKeysPrev, ...subKeysCurr])) {
            if (prevVal[subKey] !== currVal[subKey]) return true;
          }
        }
      }

      return false;
    }

export function debounceBoardFunction(debounceMap, boardId, key, fn, delay) {
  if (!debounceMap[boardId]) {
    debounceMap[boardId] = {};
  }

  const boardEntry = debounceMap[boardId];

  if (!boardEntry[key]) {
    boardEntry[key] = {
      latestFn: fn,
      debounced: _.debounce(async () => {
        try {
        //   console.log(`[${boardId}:${key}] Debounced function executing`);
          await boardEntry[key].latestFn();
        } catch (err) {
        //   console.error(`[${boardId}:${key}] Error in debounced function:`, err);
        }
      }, delay),
    };
  } else {
    boardEntry[key].latestFn = fn;
  }

//   console.log(`[${boardId}:${key}] Debounced function triggered`);
  boardEntry[key].debounced();
}
