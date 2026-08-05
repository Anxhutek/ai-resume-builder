"""
AI Resume Builder — FastAPI Backend
HackTeam AI OS | Built with Gemini AI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.routes import resume, health
from app.core.config import settings

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Resume Builder API starting...")
    yield
    logger.info("🛑 AI Resume Builder API shutting down...")


app = FastAPI(
    title="AI Resume Builder API",
    description="Generate tailored, ATS-optimized resumes using Google Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(resume.router, prefix="/api/v1", tags=["Resume"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
