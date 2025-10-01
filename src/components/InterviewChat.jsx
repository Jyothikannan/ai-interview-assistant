import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { questions } from "../constants/questions";
import { saveAnswer, updateScore } from "../store/candidateSlice";
import { message, Button, Input, Progress } from "antd";

const { TextArea } = Input;

function InterviewChat({ candidateId }) {
  const dispatch = useDispatch();
  const candidate = useSelector((state) =>
    state.candidates.list.find((c) => c.id === candidateId)
  );

  const [currentIndex, setCurrentIndex] = useState(
    candidate ? candidate.currentQuestion : 0
  );
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(
    candidate ? questions[currentIndex].time : 0
  );

  const intervalRef = useRef(null);

  // Start/Reset timer when currentIndex changes
  useEffect(() => {
    if (!candidate || candidate.completed) return;

    setTimer(questions[currentIndex].time);

    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleSubmit();
          return questions[currentIndex + 1]
            ? questions[currentIndex + 1].time
            : 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  if (!candidate) return <p>Candidate not found.</p>;
  if (candidate.completed) return <p>Interview completed!</p>;

  const handleSubmit = () => {
    // Save current answer
    dispatch(saveAnswer({ id: candidate.id, answer }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setTimer(questions[currentIndex + 1].time);
    } else {
      // Complete interview
      const finalScore = Math.floor(Math.random() * 41) + 60; // Random 60–100
      dispatch(updateScore({ id: candidate.id, score: finalScore }));
      dispatch(saveAnswer({ id: candidate.id, answer })); // Save last answer
      message.success(`Interview completed! Final Score: ${finalScore}`);
    }
  };

  const timePercent = questions[currentIndex].time
    ? ((questions[currentIndex].time - timer) / questions[currentIndex].time) * 100
    : 0;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>
        Question {currentIndex + 1} ({questions[currentIndex].level})
      </h3>
      <p>{questions[currentIndex].question}</p>

      <TextArea
        rows={4}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
      />

      <div style={{ marginTop: 10 }}>
        <Progress percent={timePercent} />
        <p>Time left: {timer}s</p>
        <Button type="primary" onClick={handleSubmit} style={{ marginTop: 10 }}>
          Submit
        </Button>
      </div>
    </div>
  );
}

export default InterviewChat;
