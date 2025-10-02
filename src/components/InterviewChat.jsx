// InterviewChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer, updateScore } from "../store/candidateSlice";
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
    // Reset timer for new question
  setTimer(questions[currentIndex].time || 0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleSubmit(); // auto-submit when timer runs out
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
        <QuestionsList questions={questions} />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (submitting) return; // prevent double submit
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
      // Use relative URL (works with Vite proxy)
      const res = await axios.post("/api/score-answer", {
        question: currentQuestionObj.question,
        answer,
      });

      const aiScore = res.data?.score ?? 0;

      // Save answer in Redux
      dispatch(saveAnswer({
        id: candidate.id,
        questionIndex: currentIndex,
        answer,
      }));

      // Update local scores array
      setScores((prev) => [...prev, aiScore]);

      // Move to next question or complete interview
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        setTimer(questions[currentIndex + 1]?.time || 0);
      } else {
        const finalScore = Math.round([...scores, aiScore].reduce((a, b) => a + b, 0) / ([...scores, aiScore].length));
        dispatch(updateScore({ id: candidate.id, score: finalScore }));
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
          <Button type="primary" onClick={handleSubmit} style={{ marginTop: 10 }} disabled={submitting}>
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InterviewChat;
