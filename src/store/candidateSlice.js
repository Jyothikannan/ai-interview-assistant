import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], // all candidates
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.list.push(action.payload);
    },
  },
});

export const { addCandidate } = candidateSlice.actions;
export const candidateReducer = candidateSlice.reducer;
