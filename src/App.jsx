import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "./store/candidateSlice";
import { Table, Button } from "antd";
import ResumeUpload from "./ResumeUpload";


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

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Score", dataIndex: "score", key: "score" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Interview Assistant</h1>

      
      <ResumeUpload />

      <Button type="primary" onClick={handleAdd}>
        Add Candidate
      </Button>

      <Table
        dataSource={candidates}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 20 }}
      />
    </div>
  );
}

export default App;
