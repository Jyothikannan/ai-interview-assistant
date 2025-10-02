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
        totalQuestions: action.payload.totalQuestions || 6, // default 6
      });
    },

    saveAnswer: (state, action) => {
      const { id, question, answer, difficulty, time, aiScore } = action.payload;
      const candidate = state.list.find((c) => c.id === id);
      if (candidate) {
        candidate.answers.push({ question, answer, difficulty, time, aiScore });
        candidate.currentQuestion += 1;
        // Mark completed when all questions have been answered
        if (candidate.answers.length >= candidate.totalQuestions) {
          candidate.completed = true;
        }
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

    // ✅ Reset all candidates
    resetCandidates: (state) => {
      state.list = [];
    },
  },
});

// ✅ Export all actions including resetCandidates
export const { addCandidate, saveAnswer, updateScore, updateSummary, resetCandidates } = candidateSlice.actions;
export default candidateSlice.reducer;
