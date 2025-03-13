import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../redux/roomSlice";
import {
  setImages,
  addImage,
  removeImage,
  updateImage,
} from "../redux/imagesSlice";
import { useSocket } from '../context/SocketContext'
import { toggleSelectedKeyword } from "../redux/selectionSlice";
import {
  updateBoardNoteKeywords,
  addBoardNoteKeyword,
  deleteBoardNoteKeywords,
} from "../redux/roomSlice";
import {
  addRoomChatMessage,
  setCurrentBoardId,
  setRoomName,
  updateDesignDetails
} from "../redux/roomSlice";
import {
  updateBoard,
  removeBoardById,
  selectAllBoards,
} from "../redux/boardsSlice";
import {
  removeKeywordFromSelected,
} from "../redux/selectionSlice"
import { useAuth } from "../context/AuthContext";

const useBoardSocket = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { roomId, currentBoardId } = useSelector(
    (state) => state.room
  );

  const { user } = useAuth();
  const username = user.username
  console.log(user)
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
      if (image.boardId === currentBoardId) dispatch(addImage(image));
    });

    socket.on("deleteImage", (id) => {
      dispatch(removeImage(id));
    });

    socket.on("updateImage", (image) => {
      if (image.boardId === currentBoardId) dispatch(updateImage(image));
    });

    socket.on("newNoteKeyword", (newKw) => {
      if (newKw.boardId === currentBoardId)
        dispatch(addBoardNoteKeyword(newKw));
    });

    socket.on("updateKeywordNote", (newKw) => {
      if (newKw.boardId === currentBoardId)
        dispatch(updateBoardNoteKeywords(newKw));
    });

    socket.on("deleteNoteKeyword", (kwId) => {
      dispatch(deleteBoardNoteKeywords(kwId));
      dispatch(removeKeywordFromSelected(kwId))
    });

    socket.on("removeKeywordFromSelected", (keywordId) => {
      dispatch(removeKeywordFromSelected(keywordId))
    })

    socket.on("toggleSelectedKeyword", (kwId) => {
      dispatch(toggleSelectedKeyword(kwId));
    });

    socket.on("generateNewImage", (newBoard) => {
      dispatch(
        updateBoard({
          id: newBoard._id,
          changes: { generatedImages: newBoard.generatedImages },
        })
      );
    });

    socket.on("updateBoardName", ({boardId, boardName}) => {
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

    socket.on("cloneBoard", (newBoardId) => {
      dispatch(setCurrentBoardId(newBoardId));
    });

    socket.on("newBoard", (newBoardId) => {
      dispatch(setCurrentBoardId(newBoardId));
    });

    socket.on("deleteBoard", (deletedId) => {
      handleDeleteBoard(deletedId);
    });

    socket.on("updateDesignDetails", (designDetails) => {
      dispatch(updateDesignDetails(designDetails))
    });

    // this on image component
    // socket.on("updateKeyword", (newKw) => console.log(newKw))
    socket.on("sendChat", (newMessage) => dispatch(addRoomChatMessage(newMessage)))

    return () => {
      socket.emit("leave room", { username, roomId });
      socket.off("updateRoomUsers");
      socket.off("loadImages");
      socket.off("newImage");
      socket.off("deleteImage");
      socket.off("updateImage");
      socket.off("newNoteKeyword");
      socket.off("updateKeywordNote");
      socket.off("deleteNoteKeyword");
      socket.off("toggleSelectedKeyword");
      socket.off("generateNewImage");
      socket.off("cloneBoard");
      socket.off("newBoard");
      socket.off("deleteBoard");
      socket.off("updateRoomName");
      socket.off("updateBoardName");
      socket.off("updateDesignDetails");
      socket.off("sendChat")
    };
  }, [socket, username, roomId, dispatch, currentBoardId, boards]);
};

export default useBoardSocket;
