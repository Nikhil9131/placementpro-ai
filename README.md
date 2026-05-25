# PlacementPro AI

PlacementPro AI is a production-ready SaaS placement preparation platform built to help students optimize their technical resume, track DSA progress, practice timed aptitude assessments, and prepare for interviews using live AI chatbot interviewers.

## Features

- **Auth & Profiles:** Secure JWT credentials, streak calculations, and a GitHub-style weekly activity heatmap.
- **Aptitude Portal:** Timed practice quizzes across Quant, Logical, Verbal, and Data Interpretation, coupled with leaderboard stats.
- **DSA Tracker:** Filter coding problems by company tag and difficulty level. Keep custom solution notes.
- **AI Resume Analyzer:** PDF parser assessing ATS score, missing tech keywords, and bullet point improvements.
- **AI Mock Interview Chatbot:** Role-based (Backend, Frontend) interviewer that prompts technical and behavioral questions, evaluates user responses, and grades results.
- **AI Study Planner:** Automated day-by-day planner built around target company timelines and current skill levels.
- **Interactive Company Roadmaps:** Step-by-step prep paths for major tech firms (Google, Amazon, TCS).
- **Admin Dashboard:** Access user logs, platform analytical totals, and publish questions.

---

## Technical Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Zustand, TanStack React Query, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript, Mongoose/MongoDB, bcryptjs, JSON Web Tokens (JWT), Multer, PDF-Parse, Google Gemini API SDK (`@google/generative-ai`).
- **DevOps:** Docker, Docker Compose.

---

## Local Setup

### Prerequisite

- MongoDB instance running locally on `mongodb://localhost:27017` OR a MongoDB Atlas connection URI.
- Node.js (version 22+) and npm.
- **Google Gemini API Key** (optional, mock fallbacks are enabled if omitted).

### 1. Backend Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Setup environment variables by copying `.env.example` (or editing `.env` directly):
   ```bash
   copy .env.example .env
   ```
3. Update `GEMINI_API_KEY` and `MONGODB_URI` in `.env` if needed.
4. Install packages and start:
   ```bash
   npm install
   npm run dev
   ```
   *Note: On first startup, the database will automatically seed with default questions and roadmaps.*

### 2. Frontend Installation

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at: `http://localhost:3000`

---

## Running with Docker (Recommended)

You can spin up the complete platform (Frontend, Backend, and MongoDB Database) with a single command:

```bash
docker-compose up --build
```

- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:5000`
- **MongoDB:** `mongodb://localhost:27017`

---

## Deployment Blueprints

### 1. MongoDB Atlas (Cloud Database)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist standard network IPs.
3. Retrieve your database connection string and use it as `MONGODB_URI` in the backend environment configs.

### 2. Backend (Render / AWS EC2)

#### Render Deployment

1. Create a new Web Service on Render linked to your backend repo folder.
2. Select **Node** runtime.
3. Configure start and build scripts:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
4. Add environment variables for `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `GEMINI_API_KEY`.

#### AWS EC2 Deployment

1. Launch an Ubuntu EC2 instance. Secure port 5000 (backend API) and port 22 (SSH).
2. Install Docker & Docker Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose -y
   ```
3. Clone code, create `.env` file, and boot:
   ```bash
   sudo docker-compose up -d --build
   ```

### 3. Frontend (Vercel)

1. Connect your repository to [Vercel](https://vercel.com).
2. Configure build settings:
   - Framework: **Next.js**
   - Root Directory: `frontend`
3. Add environment variables if any client parameters are used (Vercel handles routing automatically).
4. Click Deploy.
