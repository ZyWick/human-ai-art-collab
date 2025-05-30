import { useEffect, useCallback, useRef  } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { setUsers } from "../redux/roomSlice";
import { useAuth } from "../context/AuthContext";
import {
  addImage,
  removeImage,
  updateImage,
  addKeywordToImage,
  removeKeywordFromImage,
} from "../redux/imagesSlice";
import {
  setCurrentBoardId,
  setRoomName,
  updateDesignDetails,
  updateDesignDetailsFull,
  addUploadProgress,
  updateUploadProgress,
  removeUploadProgress,
} from "../redux/roomSlice";
import {
  addBoard,
  updateBoard,
  // updateBoardIterations,
  removeBoard,
  selectAllBoards,
} from "../redux/boardsSlice";
import { addSelectedKeyword, removeSelectedKeyword } from "../redux/selectionSlice";
import {
  addKeyword,
  // addKeywords,
  removeKeyword,
  removeKeywords,
  updateKeyword,
  clearAllVotes,
} from "../redux/keywordsSlice";
import {
  addThread,
  updateThread
} from "../redux/threadsSlice"

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket   = useSocket();
  const { roomId, currentBoardId } = useSelector(s => s.room);
  const { user } = useAuth();
  const boards   = useSelector(selectAllBoards);

  // A stable wrapper for your “dispatch + meta” pattern
  const dispatchWithMeta = useCallback((actionCreator, payload, userData) => {
    dispatch({ ...actionCreator(payload), meta: userData });
  }, [dispatch]);

  // Refs to hold mutable data so our listener‑effect can stay dependency‑light
  const boardsRef           = useRef(boards);
  const currentBoardIdRef   = useRef(currentBoardId);
  useEffect(() => { boardsRef.current = boards; }, [boards]);
  useEffect(() => { currentBoardIdRef.current = currentBoardId; }, [currentBoardId]);

  // 1) join/leave room effect
  useEffect(() => {
    if (!socket) return;
    const payload = { username: user.username, userId: user.id, roomId };

    socket.emit("joinRoom", payload);
    return () => {
      socket.emit("leave room", payload);
    };
  }, [socket, user.id, user.username, roomId]);
  
    // 2) all the listeners in one place, only once
    useEffect(() => {
      if (!socket) return;
  
      const handlers = {
        addUploadProgress:        ({uploadId, fileName}) => {dispatch(addUploadProgress({ uploadId, fileName }));},
        updateUploadProgress:     ({uploadId, progress}) => {
                                  dispatch(updateUploadProgress({ uploadId, progress }));
                                  if (progress >= 100) {
                                    setTimeout(() => {
                                      dispatch(removeUploadProgress({uploadId}));
                                    }, 2000);  // 5s “grace period”
                                  }
                                },
        updateRoomUsers:          (usernames) => dispatch(setUsers(usernames)),
        updateRoomName:           ({ newRoomName, user }) =>
                                    dispatchWithMeta(setRoomName, newRoomName, user),
        updateDesignDetails:      ({ designDetails, user }) =>
                                    dispatchWithMeta(updateDesignDetails, designDetails, user),
        updateDesignDetailsDone:  ({ designDetails, user }) => {
                                    dispatchWithMeta(updateDesignDetails, designDetails, user);
                                    dispatchWithMeta(updateDesignDetailsFull, designDetails, user);
                                  },
        newImage:                 ({ image, user }) => {
                                    if (image.boardId === currentBoardIdRef.current) {
                                      // dispatchWithMeta(addKeywords, image.keywords, user);
                                      // const processed = {
                                      //   ...image,
                                      //   keywords: image.keywords.map(kw => kw._id.toString())
                                      // };
                                      dispatchWithMeta(addImage, image, user);
                                    }
                                  },
        updateImage:              ({ update, user }) => 
                                    dispatchWithMeta(updateImage, update, user),
        deleteImage:              ({ _id, keywords, user }) => {
                                    dispatchWithMeta(removeImage, _id, user);
                                    dispatchWithMeta(removeKeywords, keywords, user);
                                  },
        newBoard:                 ({ board, user }) => {
                                    console.log(board)
                                    dispatchWithMeta(addBoard, board, user)}
                                    ,
        updateBoard:              ({ update, user }) => 
                                    dispatchWithMeta(updateBoard, update, user),
        updateBoardIterations:    ({ update, user }) => {console.log(update)
                                    // dispatchWithMeta(updateBoardIterations, update, user)
                                  },
        deleteBoard:              ({ boardId: bId, user }) => {
                                    dispatchWithMeta(removeBoard, bId, user);
                                    const remaining = boardsRef.current.filter(b => b._id !== bId);
                                    if (
                                      remaining.length > 0 &&
                                      bId === currentBoardIdRef.current
                                    ) {
                                      const latest = remaining.reduce(
                                        (l, b) => l.updatedAt > b.updatedAt ? l : b,
                                        remaining[0]
                                      );
                                      dispatchWithMeta(setCurrentBoardId, latest._id, user);
                                    }
                                  },
        addThread:                ({ newThread, user }) =>
                                    dispatchWithMeta(addThread, newThread, user),
        updateThread:             ({ update, user }) =>
                                    dispatchWithMeta(updateThread, update, user),
        newKeyword:               ({ keyword, user }) => {
                                    if (keyword.boardId === currentBoardIdRef.current) {
                                      dispatchWithMeta(addKeyword, keyword, user);
                                      if (keyword.imageId) {
                                        dispatchWithMeta(
                                          addKeywordToImage,
                                          { imageId: keyword.imageId, keywordId: keyword._id },
                                          user
                                        );
                                      }
                                    }
                                  },
        deleteKeyword:            ({ keywordId, imageId, user }) => {
                                    if (imageId) {
                                      dispatchWithMeta(
                                        removeKeywordFromImage,
                                        { imageId, keywordId },
                                        user
                                      );
                                    }
                                    dispatchWithMeta(removeKeyword, keywordId, user);
                                    dispatchWithMeta(removeSelectedKeyword, keywordId, user);
                                  },
        updateKeyword:            ({ update, user }) =>
                                    dispatchWithMeta(updateKeyword, update, user),
        removeKeywordOffset:      ({ _id, user }) => {
                                    dispatchWithMeta(removeSelectedKeyword, _id, user);
                                    dispatchWithMeta(
                                      updateKeyword,
                                      { id: _id, changes: { offsetX: undefined, offsetY: undefined, isSelected: false } },
                                      user
                                    );
                                  },
        updateKeywordSelected:    ({ update, user }) => {
                                    const { id, changes } = update;
                                    dispatchWithMeta(updateKeyword, update, user);
                                    dispatchWithMeta(
                                      changes.isSelected ? addSelectedKeyword : removeSelectedKeyword,
                                      id,
                                      user
                                    );
                                  },
        clearKeywordVotes:        ({ boardId: bId, user }) => {
                                    if (bId === currentBoardIdRef.current) {
                                      dispatchWithMeta(clearAllVotes, {}, user);
                                    }
                                  }
      };
  
      // register
      Object.entries(handlers).forEach(([evt, fn]) => {
        socket.on(evt, fn);
      });
  
      // cleanup
      return () => {
        Object.keys(handlers).forEach(evt => {
          socket.off(evt);
        });
      };
    }, [socket, dispatchWithMeta, dispatch]);
  
  };
  
  export default useBoardSocket;

/*
specific updates
use case: update db, then socket emit

socket.on("updateImagePosition", ({ _id, x, y}) => {
  dispatch(updateImage({
    id: _id,
    changes: {x, y}
  }));
});

socket.on("updateImageDimension", ({ _id, x, y, width, height}) => {
console.log({ _id, x, y, width, height})
dispatch(updateImage({
  id: _id,
  changes: {x, y, width, height}
}));
});



socket.on("updateBoardName", ({ boardId, boardName }) => {
  dispatch(
    updateBoard({
      id: boardId,
      changes: { name: boardName },
    })
  );
});

    socket.on("generateNewImage", ({ boardId, newIterations }) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { iterations: newIterations },
        })
      );
    });

    socket.on("starBoard", ({boardId, isStarred}) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { isStarred: isStarred },
        })
      );
    });

    socket.on("toggleVoting", ({boardId, isVoting}) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { isVoting: isVoting},
        })
      );
    });

    socket.on("recommendFromSelectedKw", ({ boardId, keywords }) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { selectedRecommendedKeywords: keywords },
        })
      );
    });

    socket.on("recommendFromBoardKw", ({ boardId, keywords }) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { boardRecommendedKeywords: keywords },
        })
      );
    });

   
    socket.on("markThreadResolved", ({_id, isResolved}) => {
      dispatch(
        updateThread({
          id: _id,
          changes: {isResolved},
        })
      );
    });
    socket.on("editThreadValue", ({_id, value}) => {
      dispatch(
        updateThread({
          id: _id,
          changes: {value},
        })
      );
    });
    socket.on("updateKeywordOffset", ({ _id, newOffsetX, newOffsetY }) => {
      dispatch(
        updateKeyword({
          id: _id,
          changes: { offsetX: newOffsetX, offsetY: newOffsetY },
        })
      );
    });
    
    socket.on("keywordMoving", (update) => {
      dispatch(updateKeyword(update));
    });

    
    socket.on("updateKeywordVotes", ({ _id, votes, downvotes }) => {
      console.log({ _id, votes, downvotes })
      dispatch(updateKeyword({ id: _id, changes: { votes, downvotes } }));
    });

*/