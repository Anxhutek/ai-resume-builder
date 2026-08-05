# 🤖 PROMPTS.md — AI Interaction Log

> Every significant AI interaction during development of **AI Resume Builder**.
> This file is a judging artifact demonstrating AI-first development.

**Project:** AI Resume Builder  
**GitHub:** https://github.com/Anxhutek/ai-resume-builder  
**Total Interactions:** 8  
**Models Used:** Gemini 2.0 Flash  
**Built with:** HackTeam AI OS  

---

## Prompt Index

| # | Goal | Phase | Files Changed |
|---|------|-------|--------------|
| 01 | System Architecture Design | Planning | ARCHITECTURE.md |
| 02 | Backend Project Structure | Setup | backend/ |
| 03 | Gemini AI Service | Build | ai_service.py |
| 04 | Pydantic Schema Design | Build | schemas.py |
| 05 | API Routes Design | Build | routes/resume.py |
| 06 | Docker Configuration | DevOps | Dockerfile |
| 07 | GitHub Actions CI/CD | DevOps | .github/workflows/ |
| 08 | Resume Prompt Engineering | AI | ai_service.py |

---

## Prompt #01

**Goal:** System Architecture Design  
**Phase:** Planning  
**Model:** HackTeam AI OS (Gemini 2.0 Flash)  
**Time:** 2026-08-05

### Prompt Sent
```
Design complete system architecture for an AI Resume Builder that:
- Uses Google Gemini 2.0 Flash for resume generation
- FastAPI backend on Google Cloud Run
- Next.js frontend on Vercel
- ATS optimization and keyword matching
- Streaming support for real-time generation
```

### Result
Full 3-tier architecture designed: Frontend (Vercel) → Backend (Cloud Run) → Gemini AI

### Files Changed
- `ARCHITECTURE.md` — Architecture diagrams created
- `docker-compose.yml` — Infrastructure defined

### Lessons Learned
Separating AI service into its own class makes testing and swapping models easy.

---

## Prompt #02

**Goal:** FastAPI Project Structure  
**Phase:** Setup  
**Model:** HackTeam AI OS  
**Time:** 2026-08-05

### Prompt Sent
```
Create production-grade FastAPI project structure with:
- Clean architecture (routes/core/models/utils separation)
- Pydantic v2 models
- Async support throughout
- Health check endpoint for Cloud Run
- CORS middleware for Next.js frontend
```

### Result
Complete backend scaffolding with all files generated.

### Files Changed
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/api/routes/health.py`

---

## Prompt #03

**Goal:** Gemini AI Service — Core Engine  
**Phase:** Build  
**Model:** HackTeam AI OS  
**Time:** 2026-08-05

### Prompt Sent
```
Build production-ready Gemini AI service that:
- Generates tailored resumes from job descriptions
- Supports streaming for real-time UI
- Improves individual resume sections
- Generates cover letters
- Returns structured JSON with ATS match score
- Handles errors gracefully with logging
```

### Why This Prompt
Breaking down AI features into separate methods makes the service modular and testable. Streaming support is critical for good UX — users see the resume being "written" live.

### Result
`GeminiService` class with 5 methods: generate_resume, improve_section, generate_cover_letter, stream_resume, _build_resume_prompt

### Files Changed
- `backend/app/core/ai_service.py`

### Lessons Learned
Asking Gemini to return structured JSON directly saves a post-processing step. Always include a fallback JSON parser for robustness.

---

## Prompt #04

**Goal:** Resume Prompt Engineering  
**Phase:** Build  
**Model:** HackTeam AI OS  
**Time:** 2026-08-05

### Prompt Sent
```
Design the optimal prompt for Gemini to generate ATS-optimized resumes that:
- Extract keywords from job description automatically
- Quantify achievements with metrics
- Use strong action verbs
- Return structured JSON with match_score field
- Handle different tones (professional/creative/technical)
```

### Result
Detailed prompt template in `_build_resume_prompt()` with JSON schema specification.

### Files Changed
- `backend/app/core/ai_service.py` — prompt engineering section

### Lessons Learned
Specifying exact JSON schema in the prompt significantly improves consistency of AI output. Including a `match_score` field motivates the AI to think about ATS alignment.

---

*More entries will be added as development continues...*
