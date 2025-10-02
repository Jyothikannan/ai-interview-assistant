import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Input } from "antd";
import CandidateDetail from "./CandidateDetail";

const { Search } = Input;

function InterviewerDashboard() {
  const candidates = useSelector((state) => state.candidates.list || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Filter candidates safely by search text
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchText.toLowerCase()) // safe check with optional chaining
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
      render: (text) => text || "Unknown", // fallback display if name is missing
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
      <Search
        placeholder="Search candidates"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 20 }}
      />
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
