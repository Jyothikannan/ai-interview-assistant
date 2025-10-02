import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./store/candidateSlice";
import { Table, Button, Tabs, message } from "antd";
import ResumeUpload from "./components/ResumeUpload";
import InterviewChat from "./components/InterviewChat";
import axios from "axios";

const { TabPane } = Tabs;

function App() {
  const dispatch = useDispatch();
  const candidates = useSelector((state) => state.candidates.list);

  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({}); // candidateId -> questions

  const handleAdd = () => {
    const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newCandidate = {
      id: Date.now(),
      name: randomName,
      score: 0,
    };
    dispatch(addCandidate(newCandidate));
  };

  // Called after ResumeUpload finishes
  const startInterview = async (candidateId) => {
    setActiveCandidateId(candidateId);

    try {
      // Fetch AI-generated questions
      const res = await axios.post("http://localhost:5000/api/generate-questions", {
        topic: "React/Node",
      });
      const questions = res.data.questions;
      if (!questions || !questions.length) throw new Error("No questions returned");

      // Store questions for this candidate
      setQuestionsMap((prev) => ({ ...prev, [candidateId]: questions }));
    } catch (err) {
      console.error("Failed to fetch AI questions:", err);
      message.error("Failed to fetch interview questions. Try again.");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Score", dataIndex: "score", key: "score" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Interview Assistant</h1>

      <Tabs defaultActiveKey="1">
        {/* Interviewee Tab */}
        <TabPane tab="Interviewee" key="1">
          <ResumeUpload onStartInterview={startInterview} />
          {activeCandidateId ? (
            <InterviewChat
              candidateId={activeCandidateId}
              questions={questionsMap[activeCandidateId]} // pass AI questions
            />
          ) : (
            <p>Please upload a resume to start the interview.</p>
          )}
        </TabPane>

        {/* Interviewer Tab */}
        <TabPane tab="Interviewer" key="2">
          <Button
            type="primary"
            onClick={handleAdd}
            style={{ marginBottom: 20 }}
          >
            Add Candidate
          </Button>
          <Table dataSource={candidates} columns={columns} rowKey="id" />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default App;
