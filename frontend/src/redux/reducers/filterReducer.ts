import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initState: string[] = [];

const filterSlice = createSlice({
  name: "filter",
  initialState: initState,
  reducers: {
    addFilter: (state, action: PayloadAction<string>) => {
      state.push(action.payload);
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      return state.filter((filter) => filter !== action.payload);
    },
  },
});

export const { removeFilter, addFilter } = filterSlice.actions;
export default filterSlice.reducer;
