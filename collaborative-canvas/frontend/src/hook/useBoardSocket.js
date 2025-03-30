import { useEffect, useCallback  } from "react";
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
} from "../redux/roomSlice";
import {
  updateBoard,
  updateBoardIterations,
  removeBoard,
  selectAllBoards,
} from "../redux/boardsSlice";
import { addSelectedKeyword, removeSelectedKeyword } from "../redux/selectionSlice";
import {
  addKeyword,
  addKeywords,
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
  const socket = useSocket();
  const { roomId, currentBoardId } = useSelector((state) => state.room);
  const { user } = useAuth();
  const boards = useSelector(selectAllBoards);

  const dispatchWithMeta = useCallback(
    (actionCreator, payload, userData) => {
      dispatch({
        ...actionCreator(payload),
        meta: userData,
      });
    },
    [dispatch] // Dependencies should include dispatch if it's coming from a reducer
  );  
  
  useEffect(() => {
    if (!socket) return;

    const username = user.username;
    socket.emit("joinRoom", { username, userId: user.id, roomId });
    socket.on("updateRoomUsers", (usernames) => dispatch(setUsers(usernames)));
    socket.on("updateRoomName", ({newRoomName, user}) => dispatchWithMeta(setRoomName, newRoomName, user));
    socket.on("updateDesignDetails", ({designDetails, user}) => dispatchWithMeta(updateDesignDetails, designDetails, user));

    socket.on("newImage", ({image, user}) => {
      if (image.boardId === currentBoardId) {
        dispatchWithMeta(addKeywords, image.keywords);
        const processedImage = { 
          ...image, 
          keywords: image.keywords.map((kw) => kw._id.toString()) 
        };
        dispatchWithMeta(addImage, processedImage, user);
      }
    });

    socket.on("updateImage", ({update, user}) => dispatchWithMeta(updateImage, update, user));
    socket.on("deleteImage", ({ _id, keywords, user }) => {
      dispatchWithMeta(removeImage, _id, user);
      dispatchWithMeta(removeKeywords, keywords, user);
    });

    socket.on("newBoard", ({newBoardId, user}) => dispatchWithMeta(setCurrentBoardId, newBoardId, user));
    socket.on("updateBoard", ({update, user}) => dispatchWithMeta(updateBoard, update, user));
    socket.on("updateBoardIterations", ({update, user}) => dispatchWithMeta(updateBoardIterations, update, user));
    
    const handleDeleteBoard = ({boardId, user}) => {
      dispatchWithMeta(removeBoard, boardId, user);
      const remainingBoards = boards.filter((board) => board._id !== boardId);
      if (remainingBoards.length > 0 && boardId === currentBoardId) {
        const latestBoard = remainingBoards.reduce(
          (latest, board) => (latest.updatedAt > board.updatedAt ? latest : board),
          remainingBoards[0]
        );
        dispatchWithMeta(setCurrentBoardId, latestBoard._id, user);
      }
    };
    socket.on("deleteBoard", handleDeleteBoard);

    socket.on("addThread", ({newThread, user}) => dispatchWithMeta(addThread, newThread, user));
    socket.on("updateThread", ({update, user}) => dispatchWithMeta(updateThread, update, user));

    socket.on("newKeyword", ({keyword, user}) => {
      if (keyword.boardId === currentBoardId) {
        dispatchWithMeta(addKeyword, keyword, user);
        if (keyword.imageId) {
          dispatchWithMeta(addKeywordToImage, { imageId: keyword.imageId, keywordId: keyword._id }, user);
        }
      }
    });

    socket.on("deleteKeyword", ({ keywordId, imageId, user }) => {
      if (imageId) {
        dispatchWithMeta(removeKeywordFromImage, { imageId, keywordId }, user);
      }
      dispatchWithMeta(removeKeyword, keywordId, user);
      dispatchWithMeta(removeSelectedKeyword, keywordId, user);
    });

    socket.on("updateKeyword", ({update, user}) => dispatchWithMeta(updateKeyword, update, user));

    socket.on("removeKeywordOffset", ({ _id, user }) => {
      dispatchWithMeta(removeSelectedKeyword, _id, user);
      dispatchWithMeta(updateKeyword, { id: _id, changes: { offsetX: undefined, offsetY: undefined, isSelected: false } }, user);
    });

    socket.on("updateKeywordSelected", ({ update, user }) => {
      const  { id, changes } = update
      dispatchWithMeta(updateKeyword, update, user);
      dispatchWithMeta(changes.isSelected ? addSelectedKeyword : removeSelectedKeyword, id, user);
    });

    socket.on("clearKeywordVotes", ({boardId, user}) => {
      if (boardId === currentBoardId) {
        dispatchWithMeta(clearAllVotes, {}, user);
      }
    });

    return () => {
      socket.emit("leave room", { username, roomId });
      socket.removeAllListeners();
    };
  }, [socket, user, roomId, dispatch, currentBoardId, boards, dispatchWithMeta]);

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