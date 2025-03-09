// import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
// import { ofType } from "redux-observable";
// import { take, tap } from "rxjs";

// export const SELECTED_LABEL_LIST_PREFIX = "SELECTED_LABEL_LIST";

// export const selectedLabelListEntity = createEntityAdapter();

// export const selectedLabelListSlice = createSlice({
//   name: SELECTED_LABEL_LIST_PREFIX,
//   initialState: selectedLabelListEntity.setAll(selectedLabelListEntity.getInitialState(), []),
//   reducers: {
//     initialize(state, action) {
//       selectedLabelListEntity.setAll(state, action.payload);
//     },
//     addItem(state, action) {
//       selectedLabelListEntity.addOne(state, action.payload);
//     },
//     removeItem(state, action) {
//       selectedLabelListEntity.removeOne(state, action.payload);
//     },
//     reset(state) {
//       selectedLabelListEntity.removeAll(state);
//     },
//   },
// });

// const selectedLabelListReducer = selectedLabelListSlice.reducer;

// export const selectedLabelListSelector = selectedLabelListEntity.getSelectors(
//   (state) => state.selectedLabelList
// );

// export const selectedLabelListAction = selectedLabelListSlice.actions;

// export const selectedLabelListEpic = (action$) =>
//   action$.pipe(
//     ofType(selectedLabelListAction.addItem.type),
//     take(1),
//     tap((action) => console.log(action.payload))
//   );

// export default selectedLabelListReducer;
