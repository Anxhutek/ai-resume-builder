"""
Gemini AI Service — Core AI Engine for Resume Builder
Uses Google Gemini 2.0 Flash for fast, high-quality resume generation
"""

import google.generativeai as genai
import asyncio
import logging
from typing import AsyncGenerator
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Production-ready Gemini AI integration."""

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "max_output_tokens": 8192,
            },
        )
        logger.info("✅ Gemini AI Service initialized")

    async def generate_resume(
        self,
        job_description: str,
        user_info: dict,
        tone: str = "professional",
    ) -> dict:
        """
        Generate a tailored, ATS-optimized resume.

        Args:
            job_description: Target job description
            user_info: User's background (skills, experience, education)
            tone: professional | creative | technical

        Returns:
            Structured resume dict with all sections
        """
        prompt = self._build_resume_prompt(job_description, user_info, tone)

        try:
            response = await asyncio.to_thread(
                self.model.generate_content, prompt
            )
            parsed = self._parse_resume_response(response.text)
            logger.info("✅ Resume generated successfully")
            return parsed
        except Exception as e:
            logger.error(f"❌ Resume generation failed: {e}")
            raise

    async def improve_section(
        self, section: str, content: str, job_description: str
    ) -> str:
        """Improve a specific resume section using AI."""
        prompt = f"""
        You are an expert resume writer and career coach.
        
        Job Description:
        {job_description}
        
        Current {section}:
        {content}
        
        Rewrite this {section} to:
        1. Be ATS-optimized with keywords from the job description
        2. Use strong action verbs
        3. Quantify achievements where possible
        4. Be concise and impactful
        
        Return ONLY the improved text, nothing else.
        """
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        return response.text.strip()

    async def generate_cover_letter(
        self, job_description: str, resume_data: dict, company_name: str
    ) -> str:
        """Generate a personalized cover letter."""
        prompt = f"""
        Write a compelling, personalized cover letter for:
        
        Company: {company_name}
        Job Description: {job_description}
        
        Candidate Background:
        Name: {resume_data.get('name', 'Candidate')}
        Skills: {', '.join(resume_data.get('skills', []))}
        Experience: {resume_data.get('summary', '')}
        
        Requirements:
        - Professional and engaging tone
        - 3 paragraphs maximum
        - Show genuine enthusiasm
        - Highlight 2-3 specific relevant skills
        - Strong closing with call to action
        
        Return ONLY the cover letter text.
        """
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        return response.text.strip()

    async def stream_resume(
        self, job_description: str, user_info: dict
    ) -> AsyncGenerator[str, None]:
        """Stream resume generation for real-time UI updates."""
        prompt = self._build_resume_prompt(job_description, user_info)
        try:
            response = await asyncio.to_thread(
                self.model.generate_content, prompt, stream=True
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error: {str(e)}"

    def _build_resume_prompt(
        self, job_description: str, user_info: dict, tone: str = "professional"
    ) -> str:
        return f"""
        You are an expert resume writer with 15+ years of experience.
        Create an ATS-optimized, tailored resume.

        TARGET JOB DESCRIPTION:
        {job_description}

        CANDIDATE INFORMATION:
        Name: {user_info.get('name', '')}
        Email: {user_info.get('email', '')}
        Phone: {user_info.get('phone', '')}
        Location: {user_info.get('location', '')}
        LinkedIn: {user_info.get('linkedin', '')}
        GitHub: {user_info.get('github', '')}
        
        Experience: {user_info.get('experience', '')}
        Education: {user_info.get('education', '')}
        Skills: {user_info.get('skills', '')}
        Projects: {user_info.get('projects', '')}
        Achievements: {user_info.get('achievements', '')}
        
        TONE: {tone}
        
        Generate a complete resume in this EXACT JSON format:
        {{
            "name": "Full Name",
            "contact": {{
                "email": "email",
                "phone": "phone",
                "location": "city, country",
                "linkedin": "url",
                "github": "url"
            }},
            "summary": "3-4 sentence professional summary tailored to the job",
            "experience": [
                {{
                    "title": "Job Title",
                    "company": "Company Name",
                    "duration": "Jan 2022 - Present",
                    "location": "City, Country",
                    "bullets": [
                        "Achievement-focused bullet with metrics",
                        "Another quantified achievement"
                    ]
                }}
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "institution": "University Name",
                    "year": "2020",
                    "gpa": "3.8/4.0",
                    "relevant_courses": ["Course 1", "Course 2"]
                }}
            ],
            "skills": {{
                "technical": ["Python", "React", "SQL"],
                "soft": ["Leadership", "Communication"],
                "tools": ["Git", "Docker", "AWS"]
            }},
            "projects": [
                {{
                    "name": "Project Name",
                    "description": "Brief description",
                    "tech_stack": ["React", "Python"],
                    "url": "github url",
                    "highlights": ["Key achievement"]
                }}
            ],
            "certifications": [
                {{
                    "name": "Cert Name",
                    "issuer": "Organization",
                    "year": "2023"
                }}
            ],
            "ats_keywords": ["keyword1", "keyword2"],
            "match_score": 85
        }}
        
        Return ONLY valid JSON, no markdown, no explanation.
        """

    def _parse_resume_response(self, raw_response: str) -> dict:
        """Parse and validate Gemini's JSON response."""
        import json
        import re

        # Clean response
        cleaned = raw_response.strip()
        cleaned = re.sub(r"```json\n?", "", cleaned)
        cleaned = re.sub(r"```\n?", "", cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            # Return structured error response
            return {"error": "Failed to parse AI response", "raw": raw_response[:500]}


# Singleton instance
gemini_service = GeminiService()
