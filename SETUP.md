# 🚀 Quick Setup Guide

## For Team Members

### 1. Clone the Repo
```bash
git clone <REPO_URL>
cd vibe
```

### 2. Backend Setup (5 min)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys
```

**Get API Keys:**
- Anthropic: https://console.anthropic.com/
- Groq: https://console.groq.com/
- Supabase: https://supabase.com/dashboard
- Elastic: https://cloud.elastic.co/
- Letta: https://app.letta.ai/
- Others: See docs/SPONSOR_REQUIREMENTS.md

**Run Backend:**
```bash
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 3. Frontend Setup (5 min)
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Add API keys
npm run dev
# Runs on http://localhost:3000
```

### 4. Pick Your Tasks
See `docs/TASKS.md` for task breakdown by person.

---

## Directory Structure

```
vibe/
├── backend/          ← FastAPI (Python)
├── frontend/         ← Next.js (TypeScript)
├── agents/           ← Fetch.ai agents
├── lens-studio/      ← Snap AR
├── docs/             ← All documentation
└── README.md         ← Start here!
```

---

## Quick Links

- **Main README**: [README.md](README.md)
- **Task Breakdown**: [docs/TASKS.md](docs/TASKS.md)
- **Brainstorming**: [docs/BRAINSTORM.md](docs/BRAINSTORM.md)
- **Sponsor Checklist**: [docs/SPONSOR_REQUIREMENTS.md](docs/SPONSOR_REQUIREMENTS.md)

---

## Need Help?

1. Check docs/ folder
2. Ask in team Discord
3. Check sponsor Discord servers
4. Google / Claude / ChatGPT

---

Let's build VIBE! 🌟
