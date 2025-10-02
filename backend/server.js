import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-13b-chat"; // Replace with LLaMA 3.2 if available on HF

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Resume Upload ---
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = req.file.path;

    let text = "";
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      req.file.originalname.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      return res.status(400).json({ error: "Only PDF or DOCX allowed" });
    }

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

// --- Helper to call Hugging Face Inference ---
async function callHuggingFace(prompt) {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result[0]?.generated_text || "";
}

// --- Generate Questions ---
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { prompt } = req.body;
    const finalPrompt =
      prompt ||
      `Generate 6 interview questions for a Full Stack React/Node role. 
       Return a JSON array: [{"question": "...", "difficulty": "easy|medium|hard", "time": 20|60|120}]`;

    const text = await callHuggingFace(finalPrompt);

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      questions = [
        { question: text.trim(), difficulty: "medium", time: 60 },
      ];
    }

    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Score Answer ---
app.post("/api/score-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer)
      return res.status(400).json({ error: "Question and answer required" });

    const prompt = `
You are an interviewer. Score the answer from 1 to 5.
Question: ${question}
Answer: ${answer}
Only return a single number (1-5).
    `;

    const text = await callHuggingFace(prompt);
    const score = parseInt(text.trim().match(/[1-5]/)?.[0] || "3", 10);
    res.json({ score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to score answer" });
  }
});

// --- Generate Candidate Summary ---
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ error: "Answers required" });

    const prompt = `
Generate a concise summary based on the following answers:
${answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join("\n")}
Return 1-2 sentences, plain text only.
    `;

    const summary = await callHuggingFace(prompt);
    res.json({ summary: summary.trim() || "No summary generated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
