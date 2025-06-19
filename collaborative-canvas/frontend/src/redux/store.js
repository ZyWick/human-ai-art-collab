import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./roomSlice";
import imagesReducer from "./imagesSlice";
import boardsReducer from "./boardsSlice";
import selectionReducer from "./selectionSlice";
import keywordsReducer from "./keywordsSlice";
import threadsReducer from "./threadsSlice";
// import customLoggerMiddleware from "../util/customLoggerMiddleware";
import {
  keywordLoggerMiddleware,
  roomLoggerMiddleware,
  imageLoggerMiddleware,
  threadLoggerMiddleware,
  boardLoggerMiddleware,
} from "../util/customLoggerMiddleware";

const store = configureStore({
  reducer: {
    room: roomReducer,
    boards: boardsReducer,
    images: imagesReducer,
    keywords: keywordsReducer,
    threads: threadsReducer,
    selection: selectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      keywordLoggerMiddleware,
      roomLoggerMiddleware,
      imageLoggerMiddleware,
      threadLoggerMiddleware,
      boardLoggerMiddleware
    ),
});

export default store;
