"""
Pydantic Models — Request & Response Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from enum import Enum


class ToneEnum(str, Enum):
    professional = "professional"
    creative = "creative"
    technical = "technical"


# ─── REQUEST MODELS ───────────────────────────────────────────

class UserInfo(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    experience: str = Field(..., description="Work experience description")
    education: str = Field(..., description="Education background")
    skills: str = Field(..., description="Technical and soft skills")
    projects: Optional[str] = None
    achievements: Optional[str] = None
    extra_activities: Optional[str] = None


class GenerateResumeRequest(BaseModel):
    job_description: str = Field(..., min_length=1, max_length=5000)
    user_info: UserInfo
    tone: ToneEnum = ToneEnum.professional


class ImproveSectionRequest(BaseModel):
    section: str = Field(..., description="summary | experience | skills | projects")
    content: str = Field(..., min_length=10)
    job_description: str = Field(..., min_length=1)


class CoverLetterRequest(BaseModel):
    job_description: str = Field(..., min_length=1)
    resume_data: Dict
    company_name: str = Field(..., min_length=2)


# ─── RESPONSE MODELS ──────────────────────────────────────────

class ContactInfo(BaseModel):
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: str
    location: Optional[str] = None
    bullets: List[str]


class EducationItem(BaseModel):
    degree: str
    institution: str
    year: str
    gpa: Optional[str] = None
    relevant_courses: Optional[List[str]] = None


class SkillsSection(BaseModel):
    technical: List[str] = []
    soft: List[str] = []
    tools: List[str] = []


class ProjectItem(BaseModel):
    name: str
    description: str
    tech_stack: List[str] = []
    url: Optional[str] = None
    highlights: List[str] = []


class CertificationItem(BaseModel):
    name: str
    issuer: str
    year: str


class ResumeData(BaseModel):
    name: str
    contact: ContactInfo
    summary: str
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    skills: SkillsSection
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[str] = []
    extra_activities: List[str] = []
    ats_keywords: List[str] = []
    match_score: int = Field(ge=0, le=100, default=0)


class GenerateResumeResponse(BaseModel):
    success: bool
    resume: Dict
    processing_time_ms: int
    model_used: str = "gemini-2.0-flash-exp"
    tokens_approximate: int = 0


class ImproveSectionResponse(BaseModel):
    success: bool
    improved_content: str
    section: str


class CoverLetterResponse(BaseModel):
    success: bool
    cover_letter: str
    word_count: int
