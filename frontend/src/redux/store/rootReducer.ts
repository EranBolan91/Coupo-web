import userProfileSlice from "../reducers/profileReducer";
import wishlistSlice from "../reducers/wishListReducer";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  wishlist: wishlistSlice,
  profile: userProfileSlice,
});

export default rootReducer;
