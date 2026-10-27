import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initState: string[] = [];

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: initState,
  reducers: {
    initWishlist: (_state, action: PayloadAction<string[]>) => action.payload,
  },
});

export const { initWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
