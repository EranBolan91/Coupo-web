import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initState: string[] = [];

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: initState,
  reducers: {
    initWishlist: (state, action: PayloadAction<string[]>) => {
      state = action.payload;
    },
  },
});

export const { initWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
