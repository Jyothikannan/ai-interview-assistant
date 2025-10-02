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
        answers: [],          // Stores { question, answer, difficulty, time }
        currentQuestion: 0,   // Index of current question
        completed: false,     // Interview completed
        summary: "",          // AI-generated summary
      });
    },

    saveAnswer: (state, action) => {
      const { id, question, answer, difficulty, time } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) {
        candidate.answers.push({ question, answer, difficulty, time });
        candidate.currentQuestion += 1;
        if (candidate.currentQuestion >= 6) candidate.completed = true;
      }
    },

    updateScore: (state, action) => {
      const { id, score } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) candidate.score = score;
    },

    updateSummary: (state, action) => {
      const { id, summary } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) candidate.summary = summary;
    },
  },
});

export const { addCandidate, saveAnswer, updateScore, updateSummary } = candidateSlice.actions;
export default candidateSlice.reducer;
