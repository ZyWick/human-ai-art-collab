import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./roomSlice";
import imagesReducer from "./imagesSlice";
// store.js
import boardsReducer from './boardsSlice'
import selectionReducer from './selectionSlice'
import keywordsReducer from './keywordsSlice'

const store = configureStore({
  reducer: {
    selection: selectionReducer,
    room: roomReducer,
    boards: boardsReducer,
    images: imagesReducer,
    keywords: keywordsReducer
  },
});

export default store;


// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import { createEpicMiddleware } from "redux-observable";
// import { persistReducer } from "redux-persist";
// import { createLogger } from "redux-logger";
// import storage from "redux-persist/lib/storage";
// import persistStore from "redux-persist/es/persistStore";
// import selectedLabelListReducer from "./selectedLabelList";

// const epicMiddleware = createEpicMiddleware();

// const rootReducer = combineReducers({
//   selectedLabelList: selectedLabelListReducer,
// });

// const persistConfig = {
//   key: "root",
//   storage,
// };
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const configureMoodboardStore = (preloadedState) => {
//   const loggerMiddleware = createLogger();
//   const store = configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({ serializableCheck: false }).concat(
//         epicMiddleware,
//         loggerMiddleware
//       ),
//     preloadedState,
//   });

//   const persistor = persistStore(store);

//   return { store, persistor };
// };

// export default configureMoodboardStore;
