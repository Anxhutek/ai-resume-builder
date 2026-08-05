"""
Resume API Routes
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
import logging

from app.models.schemas import (
    GenerateResumeRequest, GenerateResumeResponse,
    ImproveSectionRequest, ImproveSectionResponse,
    CoverLetterRequest, CoverLetterResponse,
)
from app.core.ai_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/resume/generate", response_model=GenerateResumeResponse)
async def generate_resume(request: GenerateResumeRequest):
    """
    Generate a tailored, ATS-optimized resume using Gemini AI.
    
    - Analyzes job description for keywords
    - Tailors experience and skills sections
    - Returns structured resume data + ATS match score
    """
    start_time = datetime.utcnow()
    try:
        resume_data = await gemini_service.generate_resume(
            job_description=request.job_description,
            user_info=request.user_info.model_dump(),
            tone=request.tone.value,
        )
        processing_time = int(
            (datetime.utcnow() - start_time).total_seconds() * 1000
        )
        return GenerateResumeResponse(
            success=True,
            resume=resume_data,
            processing_time_ms=processing_time,
        )
    except Exception as e:
        logger.error(f"Resume generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume/improve-section", response_model=ImproveSectionResponse)
async def improve_section(request: ImproveSectionRequest):
    """Improve a specific resume section using AI."""
    try:
        improved = await gemini_service.improve_section(
            section=request.section,
            content=request.content,
            job_description=request.job_description,
        )
        return ImproveSectionResponse(
            success=True,
            improved_content=improved,
            section=request.section,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate a personalized cover letter."""
    try:
        cover_letter = await gemini_service.generate_cover_letter(
            job_description=request.job_description,
            resume_data=request.resume_data,
            company_name=request.company_name,
        )
        return CoverLetterResponse(
            success=True,
            cover_letter=cover_letter,
            word_count=len(cover_letter.split()),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume/stream")
async def stream_resume(request: GenerateResumeRequest):
    """Stream resume generation for real-time UI updates."""
    async def event_generator():
        async for chunk in gemini_service.stream_resume(
            job_description=request.job_description,
            user_info=request.user_info.model_dump(),
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
