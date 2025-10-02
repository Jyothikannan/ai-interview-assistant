import React from "react";
import { Card, List, Tag } from "antd";

function QuestionsList({ questions }) {
  if (!questions || questions.length === 0) {
    return <p>No questions available yet.</p>;
  }

  return (
    <Card title="AI-Generated Interview Questions" style={{ marginTop: 20 }}>
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              title={
                <div>
                  <strong>Q{index + 1}:</strong> {item.question}
                  <Tag
                    color={
                      item.difficulty === "easy"
                        ? "green"
                        : item.difficulty === "medium"
                        ? "orange"
                        : "red"
                    }
                    style={{ marginLeft: 10 }}
                  >
                    {item.difficulty}
                  </Tag>
                </div>
              }
            />
            <p>
              <strong>Recommended time:</strong> {item.time} seconds
            </p>
          </List.Item>
        )}
      />
    </Card>
  );
}

export default QuestionsList;
