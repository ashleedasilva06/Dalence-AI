# AI Career Platform

AI-powered resume analysis and career guidance platform built for MCA final year project.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| AI/NLP | Claude API (Anthropic), spaCy, Sentence Transformers |
| Database | PostgreSQL (Neon.tech free tier) |
| Vectors | ChromaDB (in-process, no server needed) |
| Files | Cloudinary free tier |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Local Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL (local or Neon.tech free cloud)

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python3.12 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download spaCy English model
python -m spacy download en_core_web_sm

# 4. Set up environment
cp .env.example .env
# Edit .env and fill in your keys (see below)

# 5. Run the server
uvicorn main:app --reload --port 8000
```

The API will be live at: http://localhost:8000
Interactive docs at: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start dev server
npm run dev
```

App will be live at: http://localhost:3000

---

## Getting Your API Keys (All Free)

### 1. Anthropic Claude API
- Go to https://console.anthropic.com
- Sign up → Create API key
- Paste into `ANTHROPIC_API_KEY` in `.env`
- Default model set to `claude-3-haiku-20240307` (cheapest, fast)

### 2. PostgreSQL — Neon.tech (free cloud)
- Go to https://neon.tech → Sign up → Create project
- Copy the connection string
- Paste into `DATABASE_URL` in `.env`

### 3. Cloudinary (file storage, free tier: 10GB)
- Go to https://cloudinary.com → Sign up
- Dashboard → copy Cloud name, API Key, API Secret
- Paste into `.env`

---

## Free Deployment

### Deploy Frontend → Vercel
```bash
cd frontend
npx vercel
# Set env variable: NEXT_PUBLIC_API_URL = your Render backend URL
```

### Deploy Backend → Render
1. Push code to GitHub
2. Go to https://render.com → New Web Service → connect repo
3. Set: Root directory = `backend`, Build = `pip install -r requirements.txt`, Start = `uvicorn main:app --host 0.0.0.0 --port 10000`
4. Add all environment variables from `.env`

### Database → Neon.tech
Already handled above — just use the connection string in your Render env vars.

---

## Project Structure

```
ai-career-platform/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Centralized settings
│   ├── requirements.txt
│   ├── models/                  # SQLAlchemy DB models
│   │   ├── user.py
│   │   ├── resume.py
│   │   └── job.py
│   ├── modules/                 # Core AI modules (M1–M10)
│   │   ├── parser.py            # M1: PDF/DOCX → text
│   │   ├── nlp_processor.py     # M2: text cleaning + section extraction
│   │   ├── skill_extractor.py   # M3: AI skill detection
│   │   ├── embedder.py          # M4: sentence-transformers
│   │   ├── vector_store.py      # M5: ChromaDB
│   │   ├── career_predictor.py  # M6: Claude career matching
│   │   ├── job_matcher.py       # M7: vector + AI job matching
│   │   ├── skill_gap.py         # M8: gap analysis + roadmap
│   │   ├── resume_improver.py   # M9: quality score + rewriting
│   │   └── chatbot.py           # M10: streaming chat
│   ├── routers/                 # API route handlers
│   │   ├── auth.py
│   │   ├── resume.py
│   │   ├── analysis.py
│   │   ├── jobs.py
│   │   ├── chat.py
│   │   └── admin.py
│   └── data/
│       ├── skills_registry.json  # ← Add new skills here, no code change needed
│       └── careers_registry.json # ← Add new careers here
│
└── frontend/
    ├── app/
    │   ├── page.tsx              # Root redirect
    │   ├── (auth)/login & register
    │   ├── dashboard/
    │   ├── resume/
    │   ├── jobs/
    │   ├── chatbot/
    │   └── admin/
    ├── components/
    │   ├── layout/Sidebar.tsx
    │   ├── layout/AppShell.tsx
    │   └── ui/ResumeUpload.tsx
    ├── lib/
    │   ├── api.ts               # Axios API client
    │   └── store.ts             # Zustand auth store
    └── types/index.ts
```

---

## Adding New Technologies / Skills

Just edit `backend/data/skills_registry.json` — add the new skill to the appropriate category.
The AI will automatically reason about it in all modules. **No code change required.**

## Adding New Career Paths

Edit `backend/data/careers_registry.json` — add a new career object.
The career predictor and skill gap analyzer will pick it up immediately.

---

## Module Overview

| # | Module | What it does | AI Used |
|---|--------|-------------|---------|
| 1 | Resume Parser | Extracts text from PDF/DOCX | No — pymupdf/python-docx |
| 2 | NLP Processor | Cleans text, extracts sections | Partial — spaCy for NER |
| 3 | Skill Extractor | Detects skills with confidence scores | Yes — Claude API |
| 4 | Embedding Generator | Converts text to 384-dim vectors | No — local model |
| 5 | Vector Store | Stores and queries embeddings | No — ChromaDB |
| 6 | Career Predictor | Suggests career paths | Yes — Claude API |
| 7 | Job Matcher | Matches resume to jobs | Yes — Claude API + vectors |
| 8 | Skill Gap Analyzer | Identifies gaps + learning roadmap | Yes — Claude API |
| 9 | Resume Improver | Scores and rewrites sections | Yes — Claude API |
| 10 | AI Chatbot | Streaming career guidance | Yes — Claude API |
