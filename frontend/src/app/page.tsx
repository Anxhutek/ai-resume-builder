'use client';

import { useState } from 'react';
import { useResume } from '@/hooks/useResume';
import { ResumeData, GenerateResumeRequest } from '@/lib/api';

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = ['Job Info', 'Your Background', 'Generate'];
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
            ${i + 1 === current ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' :
              i + 1 < current ? 'bg-violet-900/50 text-violet-300' : 'bg-gray-800 text-gray-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs
              border-current">{i + 1}</span>
            {label}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 transition-all duration-500
              ${i + 1 < current ? 'bg-violet-500' : 'bg-gray-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ATS SCORE BADGE ──────────────────────────────────────────────────────────
function ATSScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const bg = score >= 80 ? 'bg-green-500/10 border-green-500/30' : score >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30';
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${bg}`}>
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-700" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94} 94`}
            className={color} strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{score}</span>
      </div>
      <div>
        <div className={`text-sm font-bold ${color}`}>ATS Match</div>
        <div className="text-xs text-gray-500">Score</div>
      </div>
    </div>
  );
}

// ─── RESUME PREVIEW ───────────────────────────────────────────────────────────
function ResumePreview({ resume, jobDescription }: { resume: ResumeData; jobDescription: string }) {
  const [activeTab, setActiveTab] = useState<'resume' | 'keywords'>('resume');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Resume is Ready!</h2>
          <p className="text-gray-400 text-sm mt-1">Tailored by Gemini 2.5 Flash</p>
        </div>
        <ATSScore score={resume.match_score} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['resume', 'keywords'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {tab === 'keywords' ? `ATS Keywords (${resume.ats_keywords.length})` : 'Resume'}
          </button>
        ))}
        <button onClick={() => window.print()}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-all">
          Download PDF
        </button>
      </div>

      {/* Resume content */}
      {activeTab === 'resume' ? (
        <div className="bg-white text-gray-900 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto font-serif print:shadow-none" id="resume-print">
          {/* Contact Header */}
          <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{resume.name}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              {resume.contact.email && <span>{resume.contact.email}</span>}
              {resume.contact.phone && <span>{resume.contact.phone}</span>}
              {resume.contact.location && <span>{resume.contact.location}</span>}
              {resume.contact.linkedin && (
                <a href={resume.contact.linkedin} className="text-blue-600 hover:underline">LinkedIn</a>
              )}
              {resume.contact.github && (
                <a href={resume.contact.github} className="text-blue-600 hover:underline">GitHub</a>
              )}
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <section className="mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
            </section>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
                Experience
              </h2>
              {resume.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">{exp.duration}</span>
                  </div>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-gray-700 text-sm">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {resume.skills && (
            <section className="mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
                Skills
              </h2>
              <div className="space-y-1 text-sm">
                {resume.skills.technical.length > 0 && (
                  <p><span className="font-semibold">Technical:</span> {resume.skills.technical.join(', ')}</p>
                )}
                {resume.skills.tools.length > 0 && (
                  <p><span className="font-semibold">Tools:</span> {resume.skills.tools.join(', ')}</p>
                )}
                {resume.skills.soft.length > 0 && (
                  <p><span className="font-semibold">Soft Skills:</span> {resume.skills.soft.join(', ')}</p>
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
                Education
              </h2>
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-gray-600">{edu.institution}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
                Projects
              </h2>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{proj.name}</h3>
                    {proj.url && <a href={proj.url} className="text-blue-600 text-xs hover:underline">↗ Link</a>}
                    <span className="text-xs text-gray-500">{proj.tech_stack.join(' • ')}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{proj.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      ) : (
        /* ATS Keywords */
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-4">
            These keywords from the job description are in your resume. Use them naturally in your responses too.
          </p>
          <div className="flex flex-wrap gap-2">
            {resume.ats_keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-violet-900/40 border border-violet-700/50 text-violet-300 rounded-full text-sm">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { resume, isGenerating, error, processingTime, generateResume, reset } = useResume();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState<'professional' | 'creative' | 'technical'>('professional');

  const [jobDesc, setJobDesc] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '', email: '', phone: '', location: '', linkedin: '', github: '',
    experience: '', education: '', skills: '', projects: '', achievements: '',
  });

  const handleGenerate = async () => {
    const payload: GenerateResumeRequest = {
      job_description: jobDesc,
      user_info: { ...userInfo },
      tone,
    };
    await generateResume(payload);
  };

  // Show result page
  if (resume) {
    return (
      <div className="min-h-screen bg-gray-950 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={reset}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              ← Build Another Resume
            </button>
            {processingTime && (
              <span className="text-xs text-gray-500">
                Generated in {(processingTime / 1000).toFixed(1)}s by Gemini 2.5 Flash
              </span>
            )}
          </div>
          <ResumePreview resume={resume} jobDescription={jobDesc} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-sm font-bold">AI</div>
            <span className="font-semibold text-white">ResumeBuilder</span>
            <span className="text-xs px-2 py-0.5 bg-violet-900/50 text-violet-300 rounded-full border border-violet-700/50">
              Gemini 2.5
            </span>
          </div>
          <a href="https://github.com/Anxhutek/ai-resume-builder" target="_blank"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            GitHub ↗
          </a>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Hero */}
        {step === 1 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-900/30 border border-violet-700/50 rounded-full text-violet-300 text-sm mb-6">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              Powered by Google Gemini 2.5 Flash
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Land Your Dream Job with an{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                AI-Crafted Resume
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Paste a job description. Add your background. Get a tailored, ATS-optimized resume in under 30 seconds.
            </p>
          </div>
        )}

        <StepIndicator current={step} total={3} />

        {/* Step 1 — Job Description */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-300 mb-2 block">
                  Job Description <span className="text-red-400">*</span>
                </span>
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here... Include requirements, responsibilities, and qualifications."
                  rows={10}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none text-sm"
                />
                <span className="text-xs text-gray-600 mt-1 block">{jobDesc.length}/5000 characters</span>
              </label>

              <div>
                <span className="text-sm font-medium text-gray-300 mb-3 block">Resume Tone</span>
                <div className="flex gap-3">
                  {(['professional', 'creative', 'technical'] as const).map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all
                        ${tone === t
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              disabled={jobDesc.length < 50}
              onClick={() => setStep(2)}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 disabled:shadow-none">
              {jobDesc.length < 50 ? `Add ${50 - jobDesc.length} more characters` : 'Continue →'}
            </button>
          </div>
        )}

        {/* Step 2 — User Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-white">Your Information</h2>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
                  { key: 'email', label: 'Email', placeholder: 'john@example.com', required: true },
                  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                  { key: 'location', label: 'Location', placeholder: 'Mumbai, India' },
                  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/...' },
                  { key: 'github', label: 'GitHub URL', placeholder: 'github.com/...' },
                ].map(({ key, label, placeholder, required }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-400 block mb-1">
                      {label} {required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      value={userInfo[key as keyof typeof userInfo]}
                      onChange={e => setUserInfo(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Large Text Areas */}
              {[
                { key: 'experience', label: 'Work Experience *', placeholder: 'Describe your work history:\nSoftware Engineer at Google (2022-Present) - Built X, Y, Z...\nIntern at Meta (2021) - Worked on...' },
                { key: 'education', label: 'Education *', placeholder: 'B.Tech Computer Science, IIT Delhi, 2022, GPA: 8.5\nRelevant courses: DSA, ML, Cloud Computing' },
                { key: 'skills', label: 'Skills *', placeholder: 'Python, React, TypeScript, Node.js, PostgreSQL, Docker, AWS, Git...' },
                { key: 'projects', label: 'Projects', placeholder: 'AI Resume Builder - Built using Gemini API + FastAPI + Next.js. GitHub: https://github.com/...' },
                { key: 'achievements', label: 'Achievements & Certifications', placeholder: 'AWS Solutions Architect (2023)\nWon XYZ Hackathon 2024\nPublished research paper on...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-400 block mb-1">{label}</label>
                  <textarea
                    value={userInfo[key as keyof typeof userInfo]}
                    onChange={e => setUserInfo(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all">
                ← Back
              </button>
              <button
                disabled={!userInfo.name || !userInfo.email || !userInfo.experience || !userInfo.skills}
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20">
                Review & Generate →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Generate */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-white">Ready to Generate</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Name', value: userInfo.name },
                  { label: 'Tone', value: tone },
                  { label: 'Job Desc', value: `${jobDesc.length} characters` },
                  { label: 'AI Model', value: 'Gemini 2.5 Flash' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-500 text-xs block">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                    </svg>
                    Gemini is crafting your resume...
                  </>
                ) : (
                  '✨ Generate My Resume'
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-6 text-center text-sm text-gray-600">
        Built with Gemini 2.5 Flash •{' '}
        <a href="https://github.com/Anxhutek/ai-resume-builder"
          className="text-violet-400 hover:text-violet-300 transition-colors">
          Open Source on GitHub
        </a>
      </footer>
    </div>
  );
}
