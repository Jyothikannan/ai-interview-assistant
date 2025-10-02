
import React from "react";
import { Button, Card, Tag, Table } from "antd";

function CandidateDetail({ candidate, goBack }) {
  const columns = [
    { title: "Question", dataIndex: "question", key: "question" },
    { title: "Answer", dataIndex: "answer", key: "answer" },
    { title: "AI Score", dataIndex: "score", key: "score" },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (text) => (
        <Tag color={text === "easy" ? "green" : text === "medium" ? "orange" : "red"}>
          {text?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "auto", marginTop: 20 }}>
      <Button onClick={goBack} style={{ marginBottom: 20 }}>
        ← Back to Dashboard
      </Button>
      <Card title={`Candidate: ${candidate.name}`} style={{ marginBottom: 20 }}>
        <p>Final Score: {candidate.score}</p>
        <p>Summary: {candidate.summary || "No summary available"}</p>
      </Card>
      <Table
        dataSource={candidate.answers || []}
        columns={columns}
        rowKey={(record, index) => index}
      />
    </div>
  );
}

export default CandidateDetail;
