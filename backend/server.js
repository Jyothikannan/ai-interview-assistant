const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");


const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Extract text (optional)
    const dataBuffer = req.file.buffer || null;
    let text = "";
    if (dataBuffer) {
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    }

    res.json({
      message: "File uploaded successfully!",
      filename: req.file.filename,
      path: req.file.path,
      extractedText: text || "Parsing skipped",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
