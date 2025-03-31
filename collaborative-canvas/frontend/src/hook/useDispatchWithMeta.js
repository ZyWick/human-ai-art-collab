import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";

const useDispatchWithMeta = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const dispatchWithMeta = useCallback(
    (actionCreator, payload) => {
      const meta = { id: user?.id, name: user?.username };
      dispatch({
        ...actionCreator(payload),
        meta,
      });
    },
    [dispatch, user] // ✅ Added `user` to dependency array
  );

  return dispatchWithMeta;
};

export default useDispatchWithMeta;
