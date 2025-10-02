import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCandidate } from "../store/candidateSlice";
import axios from "axios";
import { message, Modal, Input } from "antd";

function ResumeUpload({ onStartInterview }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [missingFields, setMissingFields] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      // Upload resume to backend
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const text = res.data.extractedText || "";

      // Simple regex extraction
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
      const phoneMatch = text.match(/\+?\d{10,15}/);
      const nameWords = text.split(/\s+/).slice(0, 3).join(" ");

      const candidate = {
        id: Date.now(),
        name: nameWords || "",
        email: emailMatch ? emailMatch[0] : "",
        phone: phoneMatch ? phoneMatch[0] : "",
        score: 0,
        filePath: res.data.path,
      };

      // Check missing fields
      const missing = {};
      if (!candidate.name) missing.name = "";
      if (!candidate.email) missing.email = "";
      if (!candidate.phone) missing.phone = "";

      if (Object.keys(missing).length > 0) {
        setMissingFields(missing);
        setModalVisible(true);
      } else {
        dispatch(addCandidate(candidate));
        onStartInterview(candidate.id);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = () => {
    const candidate = {
      id: Date.now(),
      ...missingFields,
      score: 0,
    };
    dispatch(addCandidate(candidate));
    setModalVisible(false);
    onStartInterview(candidate.id);
  };

  const handleFieldChange = (field, value) => {
    setMissingFields((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} disabled={loading} />
      {loading && <p>Uploading and parsing resume...</p>}

      <Modal
        title="Fill Missing Fields"
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
      >
        {Object.keys(missingFields).map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            <label>{field}</label>
            <Input
              value={missingFields[field]}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={`Enter ${field}`}
            />
          </div>
        ))}
      </Modal>
    </div>
  );
}

export default ResumeUpload;
