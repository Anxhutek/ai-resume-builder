"""Health Check Routes"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check — required for Cloud Run."""
    return {
        "status": "healthy",
        "service": "AI Resume Builder API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/")
async def root():
    return {
        "message": "AI Resume Builder API",
        "docs": "/docs",
        "version": "1.0.0",
    }
