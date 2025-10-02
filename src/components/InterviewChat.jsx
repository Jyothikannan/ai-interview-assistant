// InterviewChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer, updateScore, updateSummary } from "../store/candidateSlice"; // <-- add updateSummary
import { message, Button, Input, Progress, Card, Tag } from "antd";
import axios from "axios";
import QuestionsList from "./QuestionsList"; // adjust path if needed

const { TextArea } = Input;

function InterviewChat({ candidateId, questions }) {
  const dispatch = useDispatch();
  const candidate = useSelector((state) =>
    state.candidates.list.find((c) => c.id === candidateId)
  );

  const [currentIndex, setCurrentIndex] = useState(() => candidate?.currentQuestion || 0);
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(() => questions?.[candidate?.currentQuestion || 0]?.time || 0);
  const [scores, setScores] = useState([]); // store AI scores per question
  const [submitting, setSubmitting] = useState(false); // prevent multiple submissions

  const intervalRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (!questions || !questions[currentIndex] || candidate?.completed) return;

    setTimer(questions[currentIndex].time || 0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, questions, candidate]);

  if (!candidate) return <p>Candidate not found.</p>;
  if (!questions || questions.length === 0) return <p>Waiting for AI-generated questions...</p>;

  // Interview completed view
  if (candidate.completed) {
    return (
      <div style={{ marginTop: 20 }}>
        <p>Interview completed! Final Score: {candidate.score}</p>
        <p><strong>Summary:</strong> {candidate.summary || "No summary available"}</p>
        <QuestionsList questions={questions} />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (submitting) return;
    const currentQuestionObj = questions[currentIndex];

    if (!currentQuestionObj) {
      message.error("No question found!");
      return;
    }

    if (!answer.trim()) {
      message.warning("Answer cannot be empty!");
      return;
    }

    setSubmitting(true);
    try {
      // Score current answer
      const res = await axios.post("/api/score-answer", {
        question: currentQuestionObj.question,
        answer,
      });

      const aiScore = res.data?.score ?? 0;

      // Save answer in Redux
      dispatch(saveAnswer({
        id: candidate.id,
        question: currentQuestionObj.question,
        answer,
        difficulty: currentQuestionObj.difficulty,
        time: currentQuestionObj.time,
        aiScore,
      }));

      const updatedScores = [...scores, aiScore];
      setScores(updatedScores);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        setTimer(questions[currentIndex + 1]?.time || 0);
      } else {
        // All questions answered → calculate final score
        const finalScore = Math.round(updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length);
        dispatch(updateScore({ id: candidate.id, score: finalScore }));

        // Generate summary from backend
        try {
          const summaryRes = await axios.post("/api/generate-summary", {
            candidateId: candidate.id,
            answers: [...candidate.answers, {
              question: currentQuestionObj.question,
              answer,
              difficulty: currentQuestionObj.difficulty,
              time: currentQuestionObj.time,
              aiScore
            }],
          });
          const summary = summaryRes.data?.summary || "No summary generated";
          dispatch(updateSummary({ id: candidate.id, summary }));
        } catch (err) {
          console.error("Failed to generate summary:", err);
        }

        message.success(`Interview completed! Final Score: ${finalScore}`);
      }
    } catch (err) {
      console.error("Error scoring answer:", err.response || err);
      const msg = err.response?.data?.error || err.message || "Failed to score answer";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const timePercent = questions[currentIndex]?.time
    ? ((questions[currentIndex].time - timer) / questions[currentIndex].time) * 100
    : 0;

  return (
    <div style={{ marginTop: 20, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
      <Card
        title={`Question ${currentIndex + 1}`}
        extra={
          <Tag
            color={
              questions[currentIndex].difficulty === "easy"
                ? "green"
                : questions[currentIndex].difficulty === "medium"
                ? "orange"
                : "red"
            }
          >
            {questions[currentIndex].difficulty.toUpperCase()}
          </Tag>
        }
      >
        <p style={{ fontSize: 16, marginBottom: 15 }}>{questions[currentIndex].question}</p>

        <TextArea
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
        />

        <div style={{ marginTop: 15 }}>
          <Progress percent={timePercent} status={timer === 0 ? "exception" : "active"} />
          <p>Time left: {timer}s</p>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ marginTop: 10 }}
            disabled={submitting}
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InterviewChat;
