import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * --- Resume Upload Endpoint ---
 */
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Uploaded file not found on server" });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    res.json({
      message: "File uploaded successfully!",
      filename: req.file.filename,
      path: filePath,
      extractedText: text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * --- AI Question Generation Endpoint ---
 */
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt:
          prompt ||
          `Generate 6 interview questions for a Full Stack React/Node role. 
           Only return a JSON array in this format:
           [{"question": "...", "difficulty": "easy|medium|hard", "time": 20|60|120}]`,
        stream: true,
      }),
    });

    let buffer = "";
    for await (const chunk of response.body) {
      const str = chunk.toString("utf8");
      str.split("\n").forEach((line) => {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) buffer += json.response;
          } catch {
            // Ignore non-JSON chunks
          }
        }
      });
    }

    let finalResult = [];
    try {
      const match = buffer.match(/```json([\s\S]*?)```/i);
      if (match) {
        finalResult = JSON.parse(match[1].trim());
      } else {
        finalResult = JSON.parse(buffer.trim());
      }
    } catch (e) {
      console.warn("Could not parse clean JSON, falling back:", e.message);
      finalResult = [
        {
          question: buffer.trim() || "Could not generate questions",
          difficulty: "medium",
          time: 60,
        },
      ];
    }

    if (!Array.isArray(finalResult)) {
      finalResult = [finalResult];
    }

    res.json({ questions: finalResult });
  } catch (err) {
    console.error("Error in /api/generate-questions:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * --- AI Scoring Endpoint ---
 */
app.post("/api/score-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!answer || !question) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const prompt = `
You are an interview evaluator. Score the following answer on a scale of 1 to 5.
Question: ${question}
Answer: ${answer}
Only return the number (1–5).
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt }),
    });

    // Use text() instead of streaming
    const buffer = await response.text();

    const match = buffer.trim().match(/[1-5]/);
    const score = match ? parseInt(match[0], 10) : 3;

    res.json({ score });
  } catch (err) {
    console.error("Error in /api/score-answer:", err);
    res.status(500).json({ error: "Failed to score answer" });
  }
});


/**
 * --- AI Candidate Summary Endpoint ---
 */
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { candidateId, answers } = req.body;

    console.log("Incoming /generate-summary request");
    console.log("Candidate ID:", candidateId);
    console.log("Answers received:", answers);

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers are required" });
    }

    const prompt = `
Generate a concise summary of this candidate based on their interview answers:
${answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join("\n")}
Provide the summary in 1–2 sentences. Return only plain text, no JSON, no markdown.
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt }),
    });

   // Stream parsing
    let buffer = "";
    for await (const chunk of response.body) {
      const lines = chunk.toString("utf8").split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) buffer += json.response + " ";
        } catch {
          // ignore non-JSON lines
        }
      }
    }

    // Clean the summary
    let summary = buffer
      .replace(/```(json)?/gi, "")
      .replace(/["{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!summary) summary = "No summary generated";

    console.log("Final cleaned summary:", summary);

    res.json({ summary });
  } catch (err) {
    console.error("Error in /api/generate-summary:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
