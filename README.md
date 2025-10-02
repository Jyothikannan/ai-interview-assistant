# AI Interview Assistant

A web application that generates technical interview questions, scores candidate answers using AI, and provides a concise candidate summary. Built with **React**, **Node.js/Express**, and **Ollama LLaMA 3.2** for AI evaluation.

**Live Demo:** [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app)  
**GitHub Repo:** [https://github.com/Jyothikannan/ai-interview-assistant](https://github.com/Jyothikannan/ai-interview-assistant)

---

## Features

- **Resume Upload**: Upload candidate resumes in PDF and Docx format and extract text.  
- **AI Question Generation**: Generate role-specific interview questions dynamically.  
- **Answer Scoring**: Automatically score candidate answers on a scale of 1–5 using AI.  
- **Candidate Summary**: Generate concise AI-powered summaries of candidate responses.  
- **Session Restore**: If a candidate refreshes or closes the page mid-interview, a “Welcome Back” modal appears and restores their progress.  
- **Frontend & Backend**: React frontend and Node.js/Express backend with CORS support.  
- **Secure File Handling**: Uploaded PDFs are stored locally and excluded from Git via `.gitignore`.  

---

## Tech Stack

- **Frontend**: React, Axios, Redux Toolkit, Ant Design  
- **Backend**: Node.js, Express, Multer, pdf-parse  
- **AI Model**: Ollama LLaMA 3.2  
- **Database**: Optional (currently uses in-memory storage for candidate answers)  
- **Bundler**: Vite  

---

## Project Structure

```text
ai-interview-assistant/
├─ backend/
│  ├─ server.js           # Express server with API endpoints
│  ├─ uploads/            # Candidate PDFs (ignored in Git)
├─ frontend/
│  ├─ src/
│  │  ├─ components/      # React components
│  │  ├─ store/           # Redux Toolkit store
│  │  ├─ App.jsx          # Main React app
│  ├─ vite.config.js       # Vite configuration
├─ package.json
├─ README.md

Installation

1.Clone the repository

git clone https://github.com/Jyothikannan/ai-interview-assistant.git
cd ai-interview-assistant

2.Install backend dependencies

cd backend
npm install

3. Install frontend dependencies

cd ../ai-interview-assistant
npm install

Running the App Locally
Backend
cd backend
node server.js
Backend runs on: http://localhost:5000

Frontend
cd frontend
npm run dev


Frontend runs on: http://localhost:5173

Workflow
Candidate Resume (PDF/Docx)
          │
          ▼
    [Upload Resume]
          │
          ▼
 [Generate Interview Questions]
          │
          ▼
[Candidate Answers Questions]
          │
          ▼
[AI Scores Answers (1–5)]
          │
          ▼
[Session Restore]
(Welcome Back modal if page is refreshed)
          │
          ▼
[Generate Candidate Summary]
          │
          ▼
[Final Summary & Insights]

Usage

Open the live frontend link.

Upload a candidate resume (PDF/Docx).

Answer the AI-generated questions.

If you refresh mid-interview, the Welcome Back modal will restore progress.

Submit all answers to see the AI score and candidate summary.

Use the Interviewer Dashboard to view all candidates, their scores, and summaries.