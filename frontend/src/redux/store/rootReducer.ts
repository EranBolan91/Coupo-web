import filterSlice from "../reducers/filterReducer";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  filters: filterSlice,
});

export default rootReducer;
