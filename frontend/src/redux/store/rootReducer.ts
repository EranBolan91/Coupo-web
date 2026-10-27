import userProfileSlice from "../reducers/profileReducer";
import wishlistSlice from "../reducers/wishListReducer";
import filterSlice from "../reducers/filterReducer";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  filters: filterSlice,
  wishlist: wishlistSlice,
  profile: userProfileSlice,
});

export default rootReducer;
