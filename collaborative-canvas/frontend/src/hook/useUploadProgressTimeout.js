import { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeUploadProgress} from "../redux/roomSlice";
const STALL_TIMEOUT = 60000; // 30 seconds

export const useUploadProgressTimeout = () => {
  const dispatch = useDispatch();

  const uploadTimeouts = useMemo(() => new Map(), []);

  const resetStallTimeout = useCallback((uploadId) => {
    const existingTimeout = uploadTimeouts.get(uploadId);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      console.warn(`Upload ${uploadId} stalled. Removing.`);
      dispatch(removeUploadProgress({ uploadId }));
      uploadTimeouts.delete(uploadId);
    }, STALL_TIMEOUT);

    uploadTimeouts.set(uploadId, timeout);
  }, [dispatch, uploadTimeouts]);

  const clearStallTimeout = useCallback((uploadId) => {
    const existingTimeout = uploadTimeouts.get(uploadId);
    if (existingTimeout) clearTimeout(existingTimeout);
    uploadTimeouts.delete(uploadId);
  }, [uploadTimeouts]);

  return {
    resetStallTimeout,
    clearStallTimeout
  };
};
