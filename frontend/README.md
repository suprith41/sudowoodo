# Sudowoodo

Sudowoodo is a full-stack document extraction app:

- Frontend: React + Vite
- Backend: FastAPI
- Extraction: Groq-compatible OpenAI client

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Groq API key

## Run The Project

Open two terminals from the project root.

### 1) Start Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

- `http://localhost:8000/health`

### 2) Start Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:5173`

The frontend sends extraction requests to `http://localhost:8000/extract`.

## Supported Files

- PDF
- PNG
- JPG / JPEG
- WEBP

## Quick Usage

1. Open the frontend in your browser.
2. Upload a PDF or image.
3. Edit the JSON schema (optional).
4. Click **Run Extraction**.
5. View extracted JSON in the results panel.