import { useCallback, useRef } from 'react';
import { useDispatch } from "react-redux";

const STALL_TIMEOUT = 60000;

export const useProgressTimeout = (removeProgress) => {
  const uploadTimeouts = useRef(new Map());
  const dispatch = useDispatch();

  const resetStallTimeout = useCallback((id) => {
    const timeouts = uploadTimeouts.current;
    clearTimeout(timeouts.get(id));

    const timeout = setTimeout(() => {
      console.warn(`Progress ${id} stalled. Removing.`);
      dispatch(removeProgress(id));
      timeouts.delete(id);
    }, STALL_TIMEOUT);

    timeouts.set(id, timeout);
  }, [removeProgress,dispatch]);

  const clearStallTimeout = useCallback((id) => {
    const timeouts = uploadTimeouts.current;
    clearTimeout(timeouts.get(id));
    timeouts.delete(id);
  }, []);

  return {
    resetStallTimeout,
    clearStallTimeout
  };
};
