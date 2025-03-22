import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/roomSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
  addKeywordToImage,
  removeKeywordFromImage,
} from "../redux/imagesSlice";
import { useSocket } from "../context/SocketContext";
import { toggleSelectedKeyword } from "../redux/selectionSlice";
import {
  setCurrentBoardId,
  setRoomName,
  updateDesignDetails,
} from "../redux/roomSlice";
import {
  updateBoard,
  removeBoardById,
  selectAllBoards,
} from "../redux/boardsSlice";
import { removeKeywordFromSelected } from "../redux/selectionSlice";
import { useAuth } from "../context/AuthContext";
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
  const username = user.username;
  const boards = useSelector(selectAllBoards);

  useEffect(() => {
    if (!socket) return;

    const handleDeleteBoard = (deletedId) => {
      dispatch(removeBoardById(deletedId)); // Remove the board

      const remainingBoards = boards.filter((board) => board._id !== deletedId);

      if (remainingBoards.length > 0) {
        const latestBoard = remainingBoards.reduce(
          (latest, board) =>
            latest.updatedAt > board.updatedAt ? latest : board,
          remainingBoards[0]
        );

        if (deletedId === currentBoardId) {
          dispatch(setCurrentBoardId(latestBoard._id));
        }
      }
    };

    socket.emit("joinRoom", { username, roomId });

    socket.on("updateRoomUsers", (usernames) => dispatch(setUsers(usernames)));

    socket.on("loadImages", (images) => dispatch(setImages(images)));

    socket.on("newImage", (image) => {
      if (image.boardId === currentBoardId) {
        dispatch(addKeywords(image.keywords));

        const processedImage = {
          ...image,
          keywords: image.keywords.map((keyword) => keyword._id.toString()), // Store only IDs
        };

        dispatch(addImage(processedImage));
      }
    });

    socket.on("deleteImage", ({ _id, keywords }) => {
      dispatch(removeImage(_id));
      dispatch(removeKeywords(keywords));
    });

    socket.on("updateImage", (image) => {
      if (image.boardId === currentBoardId) dispatch(updateImage(image));
    });

    socket.on("generateNewImage", ({ boardId, newIterations }) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { iterations: newIterations },
        })
      );
    });

    socket.on("addThread", (newThread) => {
      dispatch(addThread(newThread))
    })

    socket.on("updateBoardName", ({ boardId, boardName }) => {
      dispatch(
        updateBoard({
          id: boardId,
          changes: { name: boardName },
        })
      );
    });

    socket.on("updateRoomName", (newRoomName) =>
      dispatch(setRoomName(newRoomName))
    );

    socket.on("newBoard", (newBoardId) => {
      dispatch(setCurrentBoardId(newBoardId));
    });

    socket.on("deleteBoard", (deletedId) => {
      handleDeleteBoard(deletedId);
    });

    socket.on("updateDesignDetails", (designDetails) => {
      dispatch(updateDesignDetails(designDetails));
    });

    socket.on("starBoard", (board) => {
      dispatch(
        updateBoard({
          id: board._id,
          changes: { isStarred: board.isStarred },
        })
      );
    });

    socket.on("toggleVoting", (board) => {
      dispatch(
        updateBoard({
          id: board._id,
          changes: { isVoting: board.isVoting },
        })
      );
    });

    socket.on("markThreadResolved", ({_id, isResolved}) => {
      console.log({_id, isResolved})
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

    socket.on("removeKeywordOffset", ({ _id }) => {
      dispatch(
        updateKeyword({
          id: _id,
          changes: { offsetX: undefined, offsetY: undefined },
        })
      );
    });

    socket.on("keywordMoving", (update) => {
      dispatch(updateKeyword(update));
    });

    socket.on("updateKeywordSelected", ({ _id, newIsSelected }) => {
      dispatch(
        updateKeyword({ id: _id, changes: { isSelected: newIsSelected } })
      );
    });

    socket.on("updateKeywordVotes", ({ _id, votes, downvotes }) => {
      console.log({ _id, votes, downvotes })
      dispatch(updateKeyword({ id: _id, changes: { votes, downvotes } }));
    });

    socket.on("updateKeywordThreads", ({ _id, newThreads }) => {
      dispatch(
        updateKeyword({ id: _id, changes: { parentThreads: newThreads } })
      );
    });

    socket.on("clearKeywordVotes", (boardId) => {
      if (boardId === currentBoardId) {
        dispatch(clearAllVotes());
        console.log("done")
      }
    });

    socket.on("newKeyword", (newKw) => {
      if (newKw.boardId === currentBoardId) {
        dispatch(addKeyword(newKw));
        dispatch(
          addKeywordToImage({ imageId: newKw.imageId, keywordId: newKw._id })
        );
      }
    });

    socket.on("deleteKeyword", ({ keywordId, imageId }) => {
      if (imageId)
        dispatch(
          removeKeywordFromImage({ imageId: imageId, keywordId: keywordId })
        );
      dispatch(removeKeyword(keywordId));
      dispatch(removeKeywordFromSelected(keywordId));
    });

    socket.on("removeKeywordFromSelected", (keywordId) => {
      dispatch(removeKeywordFromSelected(keywordId));
    });

    socket.on("toggleSelectedKeyword", (kwId) => {
      dispatch(toggleSelectedKeyword(kwId));
    });



    return () => {
      socket.emit("leave room", { username, roomId });
      // Remove ALL event listeners
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      socket.off("generateNewImage");
      socket.off("updateBoardName");
      socket.off("updateRoomName");
      socket.off("newBoard");
      socket.off("deleteBoard");
      socket.off("addThread");
      socket.off("markThreadResolved");
      socket.off("editThreadValue");
      socket.off("updateDesignDetails");
      socket.off("starBoard");
      socket.off("toggleVoting");
      socket.off("updateKeywordOffset");
      socket.off("removeKeywordOffset");
      socket.off("keywordMoving");
      socket.off("updateKeywordSelected");
      socket.off("updateKeywordVotes");
      socket.off("updateKeywordThreads");
      socket.off("clearKeywordVotes");
      socket.off("newKeyword");
      socket.off("deleteKeyword");
      socket.off("removeKeywordFromSelected");
      socket.off("toggleSelectedKeyword");
    };
  }, [socket, username, roomId, dispatch, currentBoardId, boards]);
};

export default useBoardSocket;
