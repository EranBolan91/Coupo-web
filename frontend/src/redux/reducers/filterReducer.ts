import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initState: { [key: string]: string[] } = {};

const filterSlice = createSlice({
  name: "filter",
  initialState: initState,
  reducers: {
    initFilters: (state, action: PayloadAction<{ [key: string]: string[] }>) => {
      Object.assign(state, action.payload);
    },
    addFilter: (state, action: PayloadAction<{ [key: string]: string }>) => {
      const key = Object.keys(action.payload)[0];
      const value = Object.values(action.payload)[0];
      if (!state[key]) {
        state[key] = [];
      }
      state[key].push(value);
    },
    removeFilter: (state, action: PayloadAction<{ [key: string]: string }>) => {
      const key = Object.keys(action.payload)[0];
      const value = Object.values(action.payload)[0];
      state[key] = state[key].filter((filter) => filter !== value);
    },
  },
});

export const { initFilters, removeFilter, addFilter } = filterSlice.actions;
export default filterSlice.reducer;
