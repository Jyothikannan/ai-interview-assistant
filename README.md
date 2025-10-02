# AI Interview Assistant

A web application that generates technical interview questions, scores candidate answers using AI, and provides a concise candidate summary. Built with **React**, **Node.js/Express**, and **Ollama LLaMA 3.2** for AI evaluation.

---

## Features

- **Resume Upload**: Upload candidate resumes in PDF format and extract text.  
- **AI Question Generation**: Generate role-specific interview questions dynamically.  
- **Answer Scoring**: Automatically score candidate answers on a scale of 1–5 using AI.  
- **Candidate Summary**: Generate concise AI-powered summaries of candidate responses.  
- **Frontend & Backend**: React frontend and Node.js/Express backend with CORS support.  
- **Secure File Handling**: Uploaded PDFs are stored locally and excluded from Git via `.gitignore`.  

---

## Tech Stack

- **Frontend**: React, Axios, Redux Toolkit  
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
├─ src/
│  ├─ components/         # React components
│  ├─ store/              # Redux Toolkit store
│  ├─ App.jsx             # Main React app
├─ vite.config.js         # Vite configuration
├─ package.json
├─ README.md

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Jyothikannan/ai-interview-assistant.git
cd ai-interview-assistant

2. Install backend dependencies

cd backend
npm install

3.Install frontend dependencies

cd ../
npm install

Running the App

Start the backend server

cd backend
node server.js


Backend runs on http://localhost:5000.

Start the frontend (React + Vite)

npm run dev


Frontend runs on http://localhost:5173.


## Workflow

The AI Interview Assistant follows this workflow:

Candidate Resume (PDF)
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
[Generate Candidate Summary]
│
▼
[Final Summary & Insights]