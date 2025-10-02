import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Input, Button } from "antd";
import CandidateDetail from "./CandidateDetail";
import { resetCandidates } from "../store/candidateSlice"; // import the new action

const { Search } = Input;

function InterviewerDashboard() {
  const dispatch = useDispatch();
  const candidates = useSelector((state) => state.candidates.list || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleReset = () => {
    dispatch(resetCandidates());
    localStorage.clear(); // if you persist Redux state in localStorage
  };

  // Filter candidates safely by search text
  const filteredCandidates = candidates.filter(
    (c) => c.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        goBack={() => setSelectedCandidate(null)}
      />
    );
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "Unknown",
    },
    { title: "Final Score", dataIndex: "score", key: "score" },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      render: (text) => text || "No summary",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "auto", marginTop: 20 }}>
      <h2>Interviewer Dashboard</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Search
          placeholder="Search candidates"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" danger onClick={handleReset}>
          Clear All Candidates
        </Button>
      </div>
      <Table
        dataSource={filteredCandidates}
        columns={columns}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => setSelectedCandidate(record),
        })}
      />
    </div>
  );
}

export default InterviewerDashboard;
