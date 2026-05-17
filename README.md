# AILabAgent

AI-powered Virtual Laboratory Platform for Code-Based and Non-Code-Based Experiments.

AILabAgent is a modern educational lab platform inspired by Google Classroom, LeetCode, Jupyter, VS Code, and AI copilots. It enables teachers to create intelligent virtual labs while students can perform coding and procedural experiments with AI assistance, real-time execution, RAG-powered help, Monaco editor integration, and notebook workflows.

---

# Features

## Authentication & Roles
- Supabase Authentication
- Login / Signup
- Role-based access:
  - Teacher
  - Student

---

# Teacher Features

## Dashboard
- Create labs
- Manage experiments
- Share unique lab codes
- Track submissions
- View student progress

## Lab Management
- Code-based labs
- Non-code procedural labs
- Add experiments dynamically
- Upload PDFs, images, manuals, datasets

## Experiment Creation
- Add:
  - Title
  - Description
  - Constraints
  - Test cases
  - Points
  - Attachments

---

# Student Features

## Student Dashboard
- Join labs using lab code
- Access experiments
- Track progress
- Resume workspaces

## Code Workspace
- Monaco Editor integration
- Real-time code execution
- Multiple languages:
  - Python
  - C++
  - Java
  - JavaScript

## Notebook Workspace
- Jupyter-style notebook
- Executable cells
- Markdown + code support
- AI-assisted notebook workflow

## Non-Code Workspace
- Step-by-step guided procedural labs
- AI-generated explanations
- Workflow validation

---

# AI Features

## Contextual AI Chatbot
- Workspace-aware assistant
- Lab-aware responses
- Experiment-aware guidance
- Debugging help
- Hint generation

## RAG (Retrieval Augmented Generation)
- PDF/document understanding
- Uploaded document retrieval
- Context-aware explanations

## AI Step Generator
- Generates guided procedural steps
- Explains workflows
- Generates debugging assistance

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Monaco Editor
- React Router

## Backend
- FastAPI
- Python

## Database & Auth
- Supabase

## AI
- Grok API
- RAG pipeline
- ChromaDB

## Code Execution
- Judge0 API

---

# Project Structure

```bash
src/
 ├── app/
 │    ├── components/
 │    ├── pages/
 │    ├── workspace/
 │    ├── hooks/
 │    ├── services/
 │    ├── lib/
 │    └── utils/
 │
backend/
 ├── app/
 ├── routes/
 ├── services/
 ├── rag/
 ├── execution/
 └── db/
Environment Setup

Create a .env file in the root folder.

Add:

# =========================
# FRONTEND
# =========================

VITE_API_URL=http://127.0.0.1:8000

VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# =========================
# GROK AI
# =========================

GROK_API_KEY=YOUR_GROK_API_KEY
GROK_MODEL=grok-2-latest

# =========================
# BACKEND SUPABASE
# =========================

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

# =========================
# VECTOR / RAG
# =========================

CHROMA_DIR=./backend/.chroma
EMBEDDING_MODEL=local-hash

# =========================
# JUDGE0
# =========================

JUDGE0_API_URL=https://ce.judge0.com

JUDGE0_API_KEY=
JUDGE0_RAPIDAPI_HOST=
Installation
1. Clone Repository
git clone https://github.com/om67891/AILabAgent.git
2. Move Into Project
cd AILabAgent
3. Install Frontend Dependencies
npm install
4. Install Backend Dependencies
pip install fastapi uvicorn requests python-dotenv supabase
Running The Project
Start Backend
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

Backend:

http://127.0.0.1:8000

Health Route:

http://127.0.0.1:8000/health
Start Frontend
npm run dev

Frontend:

http://localhost:5173
Important Routes
Authentication
/login
/signup
Teacher
/dashboard
/create-lab
/teacher/lab/:labId
/teacher/lab/:labId/add-exp
Student
/student/dashboard
/student/lab/:labId
/student/lab/:labId/experiment/:experimentId
/student/lab/:labId/non-code/:experimentId
Supabase Setup

Run:

backend/db/schema.sql

inside Supabase SQL Editor.

Judge0 Setup

Using public Judge0:

JUDGE0_API_URL=https://ce.judge0.com

No API key required for development.

Current Status
Implemented
Authentication UI
Teacher dashboard
Student dashboard
Lab creation
Experiment creation
Monaco integration
Notebook UI
AI chat
RAG pipeline
Judge0 execution
FastAPI backend scaffold
Supabase schema
Responsive workspace
Future Improvements
Real-time collaboration
Multi-user notebooks
Submission grading
Analytics dashboard
Docker deployment
Kubernetes deployment
Voice AI assistant
AI-generated experiments
Design Philosophy

The platform focuses on:

Minimal clean UI
Functional workflows
IDE-style learning experience
AI-assisted education
Scalable architecture
Professional dark theme

Inspired by:

LeetCode
Google Classroom
Jupyter
VS Code
GitHub Copilot
Author

Om Shrigiriwar

License

MIT License


Then:

```bash
git add README.md
git commit -m "Updated professional README"
git push
