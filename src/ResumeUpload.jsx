import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCandidate } from "./store/candidateSlice";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function ResumeUpload() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item) => item.str).join(" ");
        }

        // --- Extract Name, Email, Phone ---
        const emailMatch = textContent.match(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
        );
        const phoneMatch = textContent.match(
          /\+?\d{10,15}/
        );
        const nameMatch = textContent.split("\n")[0] || "Unknown";

        const newCandidate = {
          id: Date.now(),
          name: nameMatch.trim(),
          email: emailMatch ? emailMatch[0] : "Missing",
          phone: phoneMatch ? phoneMatch[0] : "Missing",
          score: 0, // will be updated after interview
        };

        dispatch(addCandidate(newCandidate));
        alert("Candidate added from resume!");
      } catch (error) {
        console.error("Error parsing PDF:", error);
        alert("Failed to read resume");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && <p>Processing resume...</p>}
    </div>
  );
}

export default ResumeUpload;
