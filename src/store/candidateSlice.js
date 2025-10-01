import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

export const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.list.push({
        ...action.payload,
        answers: [],          // answers for interview
        currentQuestion: 0,   // index of current question
        completed: false,     // interview completed
      });
    },
    saveAnswer: (state, action) => {
      const { id, answer } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) {
        candidate.answers.push(answer);
        candidate.currentQuestion += 1;
        if (candidate.currentQuestion >= 6) candidate.completed = true;
      }
    },
    updateScore: (state, action) => {
      const { id, score } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) candidate.score = score;
    },
  },
});

export const { addCandidate, saveAnswer, updateScore } = candidateSlice.actions;
export default candidateSlice.reducer;
