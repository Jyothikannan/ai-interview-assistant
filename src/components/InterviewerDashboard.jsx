import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Input, Button } from "antd";
import CandidateDetail from "./CandidateDetail";
import { resetCandidates, addCandidate } from "../store/candidateSlice";

const { Search } = Input;

function InterviewerDashboard() {
  const dispatch = useDispatch();
  const candidates = useSelector((state) => state.candidates.list || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Load unfinished sessions from localStorage on mount
  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("candidate_")) {
        try {
          const savedData = JSON.parse(localStorage.getItem(key));
          const exists = candidates.find((c) => c.id === savedData.id);
          if (!exists) {
            dispatch(addCandidate(savedData)); // rehydrate Redux
          }
        } catch (err) {
          console.error("Error parsing candidate data from localStorage", err);
        }
      }
    });
  }, [dispatch]);

  // Clear all candidates and unfinished sessions
  const handleReset = () => {
    dispatch(resetCandidates());
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("candidate_")) localStorage.removeItem(key);
    });
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
    {
      title: "Final Score",
      dataIndex: "score",
      key: "score",
      render: (text) => (text !== undefined ? text : "Pending"),
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      render: (text) => text || "No summary",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) =>
        record.completed ? "Completed" : "In Progress",
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
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default InterviewerDashboard;
