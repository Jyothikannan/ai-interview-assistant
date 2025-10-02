import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";   // Needed for __dirname in ES modules
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

// --- Resume Upload Endpoint ---
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


// --- AI Question Generation Endpoint ---
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

    // --- Try to clean & extract JSON ---
    let finalResult = [];
    try {
      // Case 1: Ollama wrapped in ```json ... ```
      const match = buffer.match(/```json([\s\S]*?)```/i);
      if (match) {
        finalResult = JSON.parse(match[1].trim());
      } else {
        // Case 2: Direct JSON array
        finalResult = JSON.parse(buffer.trim());
      }
    } catch (e) {
      console.warn("Could not parse clean JSON, falling back:", e.message);
      // Fallback: return one dummy question
      finalResult = [
        {
          question: buffer.trim() || "Could not generate questions",
          difficulty: "medium",
          time: 60,
        },
      ];
    }

    // Always ensure array
    if (!Array.isArray(finalResult)) {
      finalResult = [finalResult];
    }

    res.json({ questions: finalResult });
  } catch (err) {
    console.error("Error in /api/generate-questions:", err);
    res.status(500).json({ error: err.message });
  }
});
//  (Express backend)
app.post("/api/score-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    // Example: call Ollama or your AI scoring model
    const prompt = `Score the following candidate answer from 0 to 100.
Question: ${question}
Answer: ${answer}
Provide only the numeric score.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt }),
    });

    let buffer = "";
    for await (const chunk of response.body) {
      buffer += chunk.toString("utf8");
    }

    // Extract numeric score from AI response
    const scoreMatch = buffer.match(/\d{1,3}/);
    const score = scoreMatch ? parseInt(scoreMatch[0], 10) : 0;

    res.json({ score });
  } catch (err) {
    console.error("Error in /score-answer:", err);
    res.status(500).json({ error: "Failed to score answer" });
  }
});



const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
