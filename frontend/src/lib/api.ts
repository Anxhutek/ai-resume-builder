/**
 * API Client — Typed fetch wrapper for AI Resume Builder Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  experience: string;
  education: string;
  skills: string;
  projects?: string;
  achievements?: string;
}

export interface GenerateResumeRequest {
  job_description: string;
  user_info: UserInfo;
  tone: 'professional' | 'creative' | 'technical';
}

export interface ResumeData {
  name: string;
  contact: {
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    location?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    tech_stack: string[];
    url?: string;
    highlights: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  ats_keywords: string[];
  match_score: number;
}

export interface GenerateResumeResponse {
  success: boolean;
  resume: ResumeData;
  processing_time_ms: number;
  model_used: string;
}

export interface ImproveSectionResponse {
  success: boolean;
  improved_content: string;
  section: string;
}

export interface CoverLetterResponse {
  success: boolean;
  cover_letter: string;
  word_count: number;
}

// ─── API FUNCTIONS ────────────────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  /**
   * Generate a complete tailored resume
   */
  generateResume: (data: GenerateResumeRequest) =>
    apiRequest<GenerateResumeResponse>('/api/v1/resume/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Improve a specific resume section
   */
  improveSection: (section: string, content: string, jobDescription: string) =>
    apiRequest<ImproveSectionResponse>('/api/v1/resume/improve-section', {
      method: 'POST',
      body: JSON.stringify({ section, content, job_description: jobDescription }),
    }),

  /**
   * Generate a cover letter
   */
  generateCoverLetter: (
    jobDescription: string,
    resumeData: ResumeData,
    companyName: string
  ) =>
    apiRequest<CoverLetterResponse>('/api/v1/resume/cover-letter', {
      method: 'POST',
      body: JSON.stringify({
        job_description: jobDescription,
        resume_data: resumeData,
        company_name: companyName,
      }),
    }),

  /**
   * Health check
   */
  health: () => apiRequest<{ status: string }>('/health'),
};
