import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCandidate } from "../store/candidateSlice";
import * as pdfjsLib from "pdfjs-dist";
import { message } from "antd";
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function ResumeUpload() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    // Prepare formData for backend upload
    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Upload file to Node backend
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Backend upload response:", res.data);

      // Extract text locally using pdfjs
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedarray = new Uint8Array(this.result);

          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let textContent = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map((item) => item.str).join(" ");
          }

          // Extract Name, Email, Phone
          const emailMatch = textContent.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
          );
          const phoneMatch = textContent.match(/\+?\d{10,15}/);
          const words = textContent.split(/\s+/).slice(0, 3).join(" ");
          const nameMatch = words || "Unknown";

          const newCandidate = {
            id: Date.now(),
            name: nameMatch.trim(),
            email: emailMatch ? emailMatch[0] : "Missing",
            phone: phoneMatch ? phoneMatch[0] : "Missing",
            score: 0,
            filePath: res.data.path, // store backend path if needed
          };

          dispatch(addCandidate(newCandidate));
          message.success(`Candidate ${newCandidate.name} added!`);
        };
        reader.readAsArrayBuffer(file);
      } else {
        message.warning("Only PDF parsing is supported for now");
      }
    } catch (err) {
      console.error("Upload error:", err);
      message.error("Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && <p>Processing and uploading resume...</p>}
    </div>
  );
}

export default ResumeUpload;
