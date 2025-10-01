import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./store/candidateSlice";
import { Table, Button, Tabs } from "antd";
import ResumeUpload from "./components/ResumeUpload";
import axios from "axios";
import InterviewChat from "./components/InterviewChat";

const { TabPane } = Tabs;

function App() {
  const dispatch = useDispatch();
  const candidates = useSelector((state) => state.candidates.list);

  const handleAdd = () => {
    const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomScore = Math.floor(Math.random() * 100);

    const newCandidate = {
      id: Date.now(),
      name: randomName,
      score: randomScore,
    };
    dispatch(addCandidate(newCandidate));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Server response:", res.data);
      alert("Resume uploaded to backend!");
    } catch (err) {
      console.error("Upload error:", err);
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
          <ResumeUpload />
          {candidates.length > 0 ? (
            <InterviewChat candidateId={candidates[0].id} />
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
