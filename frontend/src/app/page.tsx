'use client';

import { useState, useEffect } from 'react';
import { useResume } from '@/hooks/useResume';
import { ResumeData, GenerateResumeRequest, api } from '@/lib/api';

// ─── STATE INTERFACES ────────────────────────────────────────────────────────

interface EducationEntry {
  institution: string;
  degree: string;
  branch: string;
  gpa: string;
  startYear: string;
  endYear: string;
  currentlyStudying: boolean;
}

interface ProjectEntry {
  name: string;
  description: string;
  tech_stack: string[];
  role: string;
  duration: string;
  github?: string;
  liveDemo?: string;
  highlights: string[];
}

interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  bullets: string[];
}

interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

interface ResumeForm {
  // Step 1: Profile Type
  profileType: 'fresher' | 'experienced' | null;
  importMethod: 'scratch' | 'upload' | 'linkedin' | null;

  // Step 2: Personal Info
  name: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  github: string;
  portfolio: string;

  // Step 3: Career Goal
  targetRole: string;
  experienceLevel: 'student' | 'fresher' | '1-3' | '3-5' | '5+';

  // Step 4: Education
  education: EducationEntry[];

  // Step 5: Skills
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };

  // Step 6: Projects
  projects: ProjectEntry[];

  // Step 7: Experience
  experience: ExperienceEntry[];

  // Step 8: Internships
  internships: ExperienceEntry[];

  // Step 9: Certifications
  certifications: CertificationEntry[];

  // Step 10: Achievements
  achievements: string[];

  // Step 11: Extra Activities
  extraActivities: string[];

  // Step 12: Preferences
  preferences: {
    style: 'ats' | 'modern' | 'minimal' | 'executive';
    pageLength: '1' | '2';
    accentColor: string;
    fontFamily: 'serif' | 'sans' | 'mono';
  };

  // Step 13: Job Description
  jobDescription: string;
}

const initialForm: ResumeForm = {
  profileType: null,
  importMethod: null,
  name: '',
  title: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  linkedin: '',
  github: '',
  portfolio: '',
  targetRole: '',
  experienceLevel: 'fresher',
  education: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
    tools: [],
  },
  projects: [],
  experience: [],
  internships: [],
  certifications: [],
  achievements: [],
  extraActivities: [],
  preferences: {
    style: 'ats',
    pageLength: '1',
    accentColor: '#8b5cf6', // Violet
    fontFamily: 'serif',
  },
  jobDescription: '',
};

// ─── SKILLS PRESETS ──────────────────────────────────────────────────────────
const skillSuggestions: Record<string, { technical: string[]; soft: string[]; tools: string[] }> = {
  'software engineer': {
    technical: ['Python', 'JavaScript', 'TypeScript', 'Java', 'Data Structures', 'Algorithms', 'System Design'],
    soft: ['Problem Solving', 'Teamwork', 'Communication', 'Agile Methodologies'],
    tools: ['Git', 'Docker', 'AWS', 'VS Code', 'GitHub Actions', 'Jira'],
  },
  'frontend developer': {
    technical: ['React', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'DOM Manipulation'],
    soft: ['Design Thinking', 'Collaboration', 'Attention to Detail', 'Adaptability'],
    tools: ['Webpack', 'Vite', 'Figma', 'Postman', 'Chrome DevTools', 'Vercel'],
  },
  'data analyst': {
    technical: ['SQL', 'Python', 'R', 'Data Visualization', 'Statistics', 'ETL Processes', 'A/B Testing'],
    soft: ['Critical Thinking', 'Analytical Skills', 'Storytelling', 'Presentations'],
    tools: ['Tableau', 'PowerBI', 'Excel', 'Pandas', 'Jupyter Notebook', 'BigQuery'],
  },
  'ai engineer': {
    technical: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch', 'TensorFlow', 'LLMs'],
    soft: ['Research', 'Cognitive Analysis', 'Collaboration', 'Innovating'],
    tools: ['Google Colab', 'Hugging Face', 'Weights & Biases', 'LangChain', 'CUDA'],
  },
};

export default function HomePage() {
  const { resume, isGenerating, error, generateResume, reset, setResume } = useResume();
  const [form, setForm] = useState<ResumeForm>(initialForm);
  const [step, setStep] = useState(1);
  const [aiSuggestionsActive, setAiSuggestionsActive] = useState(false);

  // Auto-initialize Class 10/12 education templates for Freshers
  useEffect(() => {
    if (step === 4 && form.education.length === 0) {
      if (form.profileType === 'fresher') {
        setForm(p => ({
          ...p,
          education: [
            { institution: '', degree: 'Graduation / B.Tech', branch: 'Computer Science', gpa: '', startYear: '', endYear: '', currentlyStudying: false },
            { institution: '', degree: 'Class XII (12th)', branch: 'Science (PCM)', gpa: '', startYear: '', endYear: '', currentlyStudying: false },
            { institution: '', degree: 'Class X (10th)', branch: 'General', gpa: '', startYear: '', endYear: '', currentlyStudying: false }
          ]
        }));
      } else {
        setForm(p => ({
          ...p,
          education: [
            { institution: '', degree: 'Graduation / B.Tech', branch: 'Computer Science', gpa: '', startYear: '', endYear: '', currentlyStudying: false }
          ]
        }));
      }
    }
  }, [step, form.profileType, form.education.length]);

  // Dynamic Step Configurator
  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: 'Welcome' },
      { id: 2, title: 'Personal Info' },
      { id: 3, title: 'Career Goal' },
      { id: 4, title: 'Education' },
      { id: 5, title: 'Skills' },
      { id: 6, title: 'Projects' },
    ];

    if (form.profileType !== 'fresher') {
      baseSteps.push({ id: 7, title: 'Experience' });
    }

    baseSteps.push(
      { id: 8, title: 'Internships' },
      { id: 9, title: 'Certifications' },
      { id: 10, title: 'Achievements' },
      { id: 11, title: 'Activities' },
      { id: 12, title: 'Preferences' },
      { id: 13, title: 'Job Description' },
      { id: 14, title: 'AI Enhancements' },
      { id: 15, title: 'Review & Verify' }
    );

    return baseSteps;
  };

  const stepsList = getSteps();
  const currentStepIndex = stepsList.findIndex(s => s.id === step) + 1;

  // Auto-fill mock extraction values for LinkedIn/Resume Upload
  const triggerMockExtraction = (method: 'upload' | 'linkedin') => {
    setForm(prev => ({
      ...prev,
      importMethod: method,
      profileType: 'experienced',
      name: 'Anshu Kumar',
      title: 'Full Stack Engineer',
      email: 'anshu@example.com',
      phone: '+91 98765 43210',
      city: 'Delhi',
      country: 'India',
      linkedin: 'linkedin.com/in/anxhutek',
      github: 'github.com/Anxhutek',
      portfolio: 'anshu.dev',
      targetRole: 'Software Engineer',
      experienceLevel: '1-3',
      education: [
        {
          institution: 'Delhi University',
          degree: 'B.Tech',
          branch: 'Computer Science',
          gpa: '8.2/10',
          startYear: '2018',
          endYear: '2022',
          currentlyStudying: false,
        },
      ],
      skills: {
        technical: ['Python', 'FastAPI', 'React', 'TypeScript', 'SQL', 'PostgreSQL'],
        soft: ['Problem Solving', 'Teamwork', 'Communication'],
        languages: ['English', 'Hindi'],
        tools: ['Git', 'Docker', 'AWS', 'Vercel'],
      },
      projects: [
        {
          name: 'AI Resume Builder',
          description: 'Tailored ATS-optimized resume generator powered by Google Gemini API.',
          tech_stack: ['FastAPI', 'Next.js', 'React', 'Python'],
          role: 'Lead Developer',
          duration: '3 Months',
          github: 'github.com/Anxhutek/ai-resume-builder',
          highlights: ['Optimized resume generation latency by 40% with streaming response.'],
        },
      ],
      experience: [
        {
          company: 'TechCorp',
          role: 'Software Engineer',
          location: 'Delhi, India',
          employmentType: 'Full-time',
          startDate: '2022-06',
          endDate: '',
          currentlyWorking: true,
          bullets: [
            'Built high-performance APIs with FastAPI reducing database connection overhead.',
            'Managed GitHub Actions CI/CD pipelines deploying directly to staging servers.',
          ],
        },
      ],
      preferences: {
        style: 'ats',
        pageLength: '1',
        accentColor: '#8b5cf6',
        fontFamily: 'serif',
      },
    }));
    setStep(2);
  };

  // Skill suggester based on Target Role
  useEffect(() => {
    if (form.targetRole) {
      const match = skillSuggestions[form.targetRole.toLowerCase().trim()];
      if (match) {
        setForm(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            technical: Array.from(new Set([...prev.skills.technical, ...match.technical])),
            soft: Array.from(new Set([...prev.skills.soft, ...match.soft])),
            tools: Array.from(new Set([...prev.skills.tools, ...match.tools])),
            languages: prev.skills.languages.length > 0 ? prev.skills.languages : ['English', 'Hindi'],
          },
        }));
      }
    }
  }, [form.targetRole]);

  // Navigate handlers
  const next = () => {
    const nextIdx = stepsList.findIndex(s => s.id === step) + 1;
    if (nextIdx < stepsList.length) {
      setStep(stepsList[nextIdx].id);
    }
  };

  const prev = () => {
    const prevIdx = stepsList.findIndex(s => s.id === step) - 1;
    if (prevIdx >= 0) {
      setStep(stepsList[prevIdx].id);
    }
  };

  // Final API Submission
  const handleFinalSubmit = async () => {
    // Compile payload
    const payload: GenerateResumeRequest = {
      job_description: form.jobDescription || 'Please tailor this resume for a general software engineer position focusing on full-stack development.',
      user_info: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: `${form.city}, ${form.country}`,
        linkedin: form.linkedin,
        github: form.github,
        experience: form.experience.map(e => `${e.role} at ${e.company} (${e.startDate} to ${e.currentlyWorking ? 'Present' : e.endDate}): ${e.bullets.join('. ')}`).join('\n'),
        education: form.education.map(e => `${e.degree} in ${e.branch} at ${e.institution} (${e.startYear}-${e.endYear}), GPA: ${e.gpa}`).join('\n'),
        skills: [...form.skills.technical, ...form.skills.tools, ...form.skills.soft].join(', '),
        projects: form.projects.map(p => `${p.name} (${p.duration}): ${p.description}. Tech stack: ${p.tech_stack.join(', ')}`).join('\n'),
      },
      tone: 'professional',
    };

    await generateResume(payload);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-gray-200">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/20">
              HT
            </div>
            <span className="font-semibold text-white tracking-wide">HackTeam AI OS</span>
            <span className="text-xs px-2 py-0.5 bg-violet-950/50 text-violet-300 rounded-full border border-violet-800/40">
              Interactive Builder
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {form.profileType && <span className="capitalize">{form.profileType} Mode</span>}
            <a
              href="https://github.com/Anxhutek/ai-resume-builder"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      {!resume ? (
        <main className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
          {/* Progress Bar */}
          <div className="w-full bg-gray-900 h-1 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-violet-500 h-full transition-all duration-300 shadow-md shadow-violet-500/50"
              style={{ width: `${(currentStepIndex / stepsList.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-mono">
              STEP {currentStepIndex} OF {stepsList.length}
            </span>
            <span className="text-xs text-violet-400 font-semibold bg-violet-950/40 px-2.5 py-1 rounded-full border border-violet-900/30">
              {stepsList[currentStepIndex - 1]?.title}
            </span>
          </div>

          {/* ChatGPT-style Coach Guidance bubble */}
          <div className="bg-gray-900/40 border border-gray-900 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-sm">
              💡
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Career Coach Advice</p>
              <p className="text-sm text-gray-300 mt-1">
                {step === 1 && "Start by choosing how to fill details. Cloned/Imported steps fill instantly to save time!"}
                {step === 2 && "Personal info represents your professional brand. Optional links help recruiters find your repositories."}
                {step === 3 && "Job target determines the auto-suggestions for skills. Choose a title close to your dream job."}
                {step === 4 && "Show your academic history. High GPAs are good, but relevant coursework acts as keyword matching."}
                {step === 5 && "Suggested skills match typical ATS checkers. Add tech tags that you are comfortable explaining."}
                {step === 6 && "Projects prove implementation capabilities. Keep descriptions action-focused."}
                {step === 7 && "Work history demonstrates execution. Quantified metrics always beat generic tasks."}
                {step === 8 && "Internships show practical project exposure under commercial deadlines."}
                {step === 9 && "Certificates validate domain knowledge. Skip if you do not hold any external credentials."}
                {step === 10 && "Achievements help you stand out. Hackathons, high coding rankings, or awards add strong impact."}
                {step === 11 && "Extracurriculars reflect cultural fit, leadership, and voluntary contribution capacity."}
                {step === 12 && "Choose your layouts. ATS Professional is optimized for standard screen parsers."}
                {step === 13 && "Pasting a specific job description allows Gemini to tailor experience headers dynamically."}
                {step === 14 && "Activate optimizations to polish grammar, adjust style, or pre-seed summaries."}
                {step === 15 && "Double check everything before compiling the final PDF bundle."}
              </p>
            </div>
          </div>

          {/* Form Wizard Panels */}
          <div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-6 shadow-xl mb-6 min-h-[300px] flex flex-col justify-between">
            {/* STEP 1: Welcome */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">👋 Welcome to AI Resume Builder</h2>
                  <p className="text-gray-400 text-sm">Select how you want to build your resume profile today.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => triggerMockExtraction('upload')}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-violet-500 transition-all text-left flex items-start gap-3 group"
                  >
                    <span className="text-xl">📄</span>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                        Upload Existing Resume
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Extract info automatically from PDF/DOCX.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => triggerMockExtraction('linkedin')}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-violet-500 transition-all text-left flex items-start gap-3 group"
                  >
                    <span className="text-xl">🔗</span>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                        Import LinkedIn Profile
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Auto-fill values using LinkedIn profile link.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setForm(p => ({ ...p, profileType: 'fresher', importMethod: 'scratch' }));
                      setStep(2);
                    }}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-violet-500 transition-all text-left flex items-start gap-3 group"
                  >
                    <span className="text-xl">🎓</span>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                        I am a Student / Fresher
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Create from scratch. Skips work experience steps.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setForm(p => ({ ...p, profileType: 'experienced', importMethod: 'scratch' }));
                      setStep(2);
                    }}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-violet-500 transition-all text-left flex items-start gap-3 group"
                  >
                    <span className="text-xl">💼</span>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                        I have Work Experience
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Include professional work history sections.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name *', placeholder: 'Anshu Kumar' },
                    { key: 'title', label: 'Professional Title *', placeholder: 'Software Engineer' },
                    { key: 'email', label: 'Email *', placeholder: 'anshu@example.com' },
                    { key: 'phone', label: 'Phone Number *', placeholder: '+91 98765 43210' },
                    { key: 'city', label: 'City *', placeholder: 'Delhi' },
                    { key: 'country', label: 'Country *', placeholder: 'India' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 font-medium block mb-1">{label}</label>
                      <input
                        type="text"
                        value={form[key as keyof ResumeForm] as string}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-850 pt-4 mt-2">
                  <span className="text-xs text-gray-500 font-semibold block mb-2">SOCIAL PROFILES (OPTIONAL)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
                      { key: 'github', label: 'GitHub', placeholder: 'github.com/...' },
                      { key: 'portfolio', label: 'Portfolio Website', placeholder: 'portfolio.dev' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-[10px] text-gray-400 font-medium block mb-1">{label}</label>
                        <input
                          type="text"
                          value={form[key as keyof ResumeForm] as string}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Career Goal */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Target Position & Experience</h3>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1">What role are you applying for?</label>
                  <input
                    type="text"
                    value={form.targetRole}
                    onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
                    placeholder="e.g. Software Engineer / Frontend Developer"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-all"
                  />
                  <div className="flex gap-2 flex-wrap mt-2">
                    {['Software Engineer', 'Frontend Developer', 'Data Analyst', 'AI Engineer'].map(role => (
                      <button
                        key={role}
                        onClick={() => setForm(p => ({ ...p, targetRole: role }))}
                        className="text-xs bg-gray-850 border border-gray-800 px-2.5 py-1 rounded-full text-gray-300 hover:border-violet-500 transition-all"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-850 pt-4 mt-2">
                  <label className="text-xs text-gray-400 font-medium block mb-2">Experience Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { key: 'student', val: 'Student' },
                      { key: 'fresher', val: 'Fresher' },
                      { key: '1-3', val: '1-3 Years' },
                      { key: '3-5', val: '3-5 Years' },
                      { key: '5+', val: '5+ Years' },
                    ].map(({ key, val }) => (
                      <button
                        key={key}
                        onClick={() => setForm(p => ({ ...p, experienceLevel: key as any }))}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all
                          ${form.experienceLevel === key
                            ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md shadow-violet-500/10'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Education */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-lg">Education History</h3>
                  <button
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        education: [
                          ...p.education,
                          {
                            institution: '',
                            degree: '',
                            branch: '',
                            gpa: '',
                            startYear: '',
                            endYear: '',
                            currentlyStudying: false,
                          },
                        ],
                      }))
                    }
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    + Add Entry
                  </button>
                </div>

                {form.education.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No education entries added yet. Click "+ Add Entry" to build profile.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {form.education.map((edu, idx) => (
                      <div key={idx} className="bg-gray-950 border border-gray-850 p-4 rounded-xl relative space-y-3">
                        <button
                          onClick={() =>
                            setForm(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))
                          }
                          className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400">Institution *</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].institution = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="IIT Delhi"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Degree *</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].degree = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="B.Tech"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {['B.Tech', 'M.Tech', 'Class XII (12th)', 'Class X (10th)'].map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setForm(p => {
                                    const eduList = [...p.education];
                                    eduList[idx].degree = d;
                                    return { ...p, education: eduList };
                                  })}
                                  className="text-[9px] bg-gray-900 border border-gray-850 px-2 py-0.5 rounded text-gray-400 hover:border-violet-500 hover:text-white"
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Branch *</label>
                            <input
                              type="text"
                              value={edu.branch}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].branch = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="Computer Science"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {['Computer Science', 'Science (PCM)', 'Commerce', 'General'].map(b => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => setForm(p => {
                                    const eduList = [...p.education];
                                    eduList[idx].branch = b;
                                    return { ...p, education: eduList };
                                  })}
                                  className="text-[9px] bg-gray-900 border border-gray-850 px-2 py-0.5 rounded text-gray-400 hover:border-violet-500 hover:text-white"
                                >
                                  {b}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">CGPA / Percentage</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].gpa = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="8.5/10"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Start Year</label>
                            <input
                              type="text"
                              value={edu.startYear}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].startYear = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="2018"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">End Year</label>
                            <input
                              type="text"
                              value={edu.endYear}
                              disabled={edu.currentlyStudying}
                              onChange={e =>
                                setForm(p => {
                                  const eduList = [...p.education];
                                  eduList[idx].endYear = e.target.value;
                                  return { ...p, education: eduList };
                                })
                              }
                              placeholder="2022"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={edu.currentlyStudying}
                            onChange={e =>
                              setForm(p => {
                                const eduList = [...p.education];
                                eduList[idx].currentlyStudying = e.target.checked;
                                if (e.target.checked) eduList[idx].endYear = 'Present';
                                return { ...p, education: eduList };
                              })
                            }
                            className="rounded border-gray-800 bg-gray-900 text-violet-600 focus:ring-0"
                          />
                          <span className="text-[11px] text-gray-400">Currently studying here</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Skills */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Skills Dashboard</h3>
                <p className="text-xs text-gray-500">Suggested skills match your target role: {form.targetRole || 'Not set'}. Click tag to remove.</p>

                {/* Technical Skills */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-400 font-semibold block">TECHNICAL SKILLS</span>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.technical.map((sk, i) => (
                      <span
                        key={i}
                        onClick={() =>
                          setForm(p => ({
                            ...p,
                            skills: {
                              ...p.skills,
                              technical: p.skills.technical.filter(item => item !== sk),
                            },
                          }))
                        }
                        className="px-2.5 py-1 bg-violet-900/30 border border-violet-800/40 text-violet-300 text-xs rounded-full cursor-pointer hover:bg-red-950/30 hover:border-red-900/40 hover:text-red-300 transition-all"
                      >
                        {sk} ×
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ Add Tech Skill (Press Enter)"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim();
                          setForm(p => ({
                            ...p,
                            skills: { ...p.skills, technical: [...p.skills.technical, val] },
                          }));
                          e.currentTarget.value = '';
                        }
                      }}
                      className="bg-gray-950 border border-gray-850 px-3 py-1 rounded-full text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Tools & Frame */}
                <div className="space-y-2 border-t border-gray-850 pt-3">
                  <span className="text-xs text-gray-400 font-semibold block">DEVELOPER TOOLS & SOFTWARE</span>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.tools.map((tk, i) => (
                      <span
                        key={i}
                        onClick={() =>
                          setForm(p => ({
                            ...p,
                            skills: { ...p.skills, tools: p.skills.tools.filter(item => item !== tk) },
                          }))
                        }
                        className="px-2.5 py-1 bg-indigo-900/30 border border-indigo-800/40 text-indigo-300 text-xs rounded-full cursor-pointer hover:bg-red-950/30 hover:border-red-900/40 hover:text-red-300 transition-all"
                      >
                        {tk} ×
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ Add Tool (Press Enter)"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim();
                          setForm(p => ({
                            ...p,
                            skills: { ...p.skills, tools: [...p.skills.tools, val] },
                          }));
                          e.currentTarget.value = '';
                        }
                      }}
                      className="bg-gray-950 border border-gray-850 px-3 py-1 rounded-full text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Soft & Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-850 pt-3">
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-semibold block">SOFT SKILLS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.soft.map((sk, i) => (
                        <span
                          key={i}
                          onClick={() =>
                            setForm(p => ({
                              ...p,
                              skills: { ...p.skills, soft: p.skills.soft.filter(item => item !== sk) },
                            }))
                          }
                          className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-300 text-[10px] rounded cursor-pointer"
                        >
                          {sk} ×
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-semibold block">LANGUAGES</span>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.languages.map((lk, i) => (
                        <span
                          key={i}
                          onClick={() =>
                            setForm(p => ({
                              ...p,
                              skills: {
                                ...p.skills,
                                languages: p.skills.languages.filter(item => item !== lk),
                              },
                            }))
                          }
                          className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-300 text-[10px] rounded cursor-pointer"
                        >
                          {lk} ×
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Projects */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-lg">Key Projects</h3>
                  <button
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        projects: [
                          ...p.projects,
                          {
                            name: '',
                            description: '',
                            tech_stack: [],
                            role: '',
                            duration: '',
                            highlights: [],
                          },
                        ],
                      }))
                    }
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    + Add Project
                  </button>
                </div>

                {form.projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No projects added. Click "+ Add Project" to insert.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {form.projects.map((proj, idx) => (
                      <div key={idx} className="bg-gray-950 border border-gray-850 p-4 rounded-xl relative space-y-3">
                        <button
                          onClick={() =>
                            setForm(p => ({ ...p, projects: p.projects.filter((_, i) => i !== idx) }))
                          }
                          className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400">Project Name *</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.projects];
                                  list[idx].name = e.target.value;
                                  return { ...p, projects: list };
                                })
                              }
                              placeholder="AI Resume Builder"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Duration</label>
                            <input
                              type="text"
                              value={proj.duration}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.projects];
                                  list[idx].duration = e.target.value;
                                  return { ...p, projects: list };
                                })
                              }
                              placeholder="2 Months"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">Description / Technologies *</label>
                          <textarea
                            value={proj.description}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.projects];
                                list[idx].description = e.target.value;
                                return { ...p, projects: list };
                              })
                            }
                            placeholder="Briefly describe what you built..."
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400">GitHub Link</label>
                            <input
                              type="text"
                              value={proj.github}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.projects];
                                  list[idx].github = e.target.value;
                                  return { ...p, projects: list };
                                })
                              }
                              placeholder="github.com/..."
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Tech Stack (comma separated)</label>
                            <input
                              type="text"
                              value={proj.tech_stack.join(', ')}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.projects];
                                  list[idx].tech_stack = e.target.value.split(',').map(s => s.trim());
                                  return { ...p, projects: list };
                                })
                              }
                              placeholder="React, FastAPI, Node"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: Experience */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-lg">Work Experience</h3>
                  <button
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        experience: [
                          ...p.experience,
                          {
                            company: '',
                            role: '',
                            location: '',
                            employmentType: 'Full-time',
                            startDate: '',
                            endDate: '',
                            currentlyWorking: false,
                            bullets: [],
                          },
                        ],
                      }))
                    }
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    + Add Experience
                  </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {form.experience.map((exp, idx) => (
                    <div key={idx} className="bg-gray-950 border border-gray-850 p-4 rounded-xl relative space-y-3">
                      <button
                        onClick={() =>
                          setForm(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }))
                        }
                        className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-400">Company *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.experience];
                                list[idx].company = e.target.value;
                                return { ...p, experience: list };
                              })
                            }
                            placeholder="Google"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">Role *</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={e =>
                              setForm(p => {
                                  const list = [...p.experience];
                                  list[idx].role = e.target.value;
                                  return { ...p, experience: list };
                                })
                            }
                            placeholder="Software Engineer"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.experience];
                                list[idx].startDate = e.target.value;
                                return { ...p, experience: list };
                              })
                            }
                            placeholder="2022-01"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate}
                            disabled={exp.currentlyWorking}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.experience];
                                list[idx].endDate = e.target.value;
                                return { ...p, experience: list };
                              })
                            }
                            placeholder="2024-05"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">Responsibilities (comma separated bullets)</label>
                        <textarea
                          value={exp.bullets.join('\n')}
                          onChange={e =>
                            setForm(p => {
                              const list = [...p.experience];
                              list[idx].bullets = e.target.value.split('\n');
                              return { ...p, experience: list };
                            })
                          }
                          placeholder="Bullet point 1&#10;Bullet point 2"
                          rows={3}
                          className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white resize-none"
                        />
                      </div>
                      <label className="flex items-center gap-2 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.currentlyWorking}
                          onChange={e =>
                            setForm(p => {
                              const list = [...p.experience];
                              list[idx].currentlyWorking = e.target.checked;
                              if (e.target.checked) list[idx].endDate = 'Present';
                              return { ...p, experience: list };
                            })
                          }
                          className="rounded border-gray-800 bg-gray-900 text-violet-600 focus:ring-0"
                        />
                        <span className="text-[11px] text-gray-400">Currently working here</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: Internships */}
            {step === 8 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-lg">Internships (Optional)</h3>
                  <button
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        internships: [
                          ...p.internships,
                          {
                            company: '',
                            role: '',
                            location: '',
                            employmentType: 'Internship',
                            startDate: '',
                            endDate: '',
                            currentlyWorking: false,
                            bullets: [],
                          },
                        ],
                      }))
                    }
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    + Add Internship
                  </button>
                </div>

                {form.internships.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No internships added. Click "+ Add Internship" if applicable.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {form.internships.map((exp, idx) => (
                      <div key={idx} className="bg-gray-950 border border-gray-850 p-4 rounded-xl relative space-y-3">
                        <button
                          onClick={() =>
                            setForm(p => ({ ...p, internships: p.internships.filter((_, i) => i !== idx) }))
                          }
                          className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400">Company *</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.internships];
                                  list[idx].company = e.target.value;
                                  return { ...p, internships: list };
                                })
                              }
                              placeholder="Startup Inc"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Role *</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={e =>
                                setForm(p => {
                                  const list = [...p.internships];
                                  list[idx].role = e.target.value;
                                  return { ...p, internships: list };
                                })
                              }
                              placeholder="Backend Intern"
                              className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 9: Certifications */}
            {step === 9 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-lg">Certifications</h3>
                  <button
                    onClick={() =>
                      setForm(p => ({
                        ...p,
                        certifications: [
                          ...p.certifications,
                          { name: '', issuer: '', year: '' },
                        ],
                      }))
                    }
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    + Add Certification
                  </button>
                </div>

                {form.certifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No certifications added. Click "+ Add Certification" to list credentials.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {form.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-gray-950 border border-gray-850 p-4 rounded-xl relative grid grid-cols-3 gap-3">
                        <button
                          onClick={() =>
                            setForm(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }))
                          }
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-950 border border-red-800 text-[10px] text-red-400 rounded-full flex items-center justify-center hover:bg-red-900"
                        >
                          ×
                        </button>
                        <div>
                          <label className="text-[10px] text-gray-400">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.certifications];
                                list[idx].name = e.target.value;
                                return { ...p, certifications: list };
                              })
                            }
                            placeholder="AWS Certified Developer"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">Issuer</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.certifications];
                                list[idx].issuer = e.target.value;
                                return { ...p, certifications: list };
                              })
                            }
                            placeholder="Amazon Web Services"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400">Year</label>
                          <input
                            type="text"
                            value={cert.year}
                            onChange={e =>
                              setForm(p => {
                                const list = [...p.certifications];
                                list[idx].year = e.target.value;
                                return { ...p, certifications: list };
                              })
                            }
                            placeholder="2023"
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 10: Achievements */}
            {step === 10 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Key Achievements</h3>
                <p className="text-xs text-gray-500">Provide bulleted achievement highlights (e.g. coding ranks, hackathons, papers).</p>
                <textarea
                  value={form.achievements.join('\n')}
                  onChange={e => setForm(p => ({ ...p, achievements: e.target.value.split('\n') }))}
                  placeholder="Won Google Hackathon 2024 (Rank 1/300 teams)&#10;5-Star Coder on CodeChef (Max Rating: 2150)&#10;Published research paper on Deep Learning at IEEE conference"
                  rows={6}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
                />
              </div>
            )}

            {/* STEP 11: Extra Activities */}
            {step === 11 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Extracurriculars & Leadership</h3>
                <p className="text-xs text-gray-500">Volunteering, open source, college clubs, sports, etc.</p>
                <textarea
                  value={form.extraActivities.join('\n')}
                  onChange={e => setForm(p => ({ ...p, extraActivities: e.target.value.split('\n') }))}
                  placeholder="Open Source contributor to FastAPI repository&#10;Lead Coordinator of College Tech Festival (2022)&#10;Volunteered at local community education centers"
                  rows={6}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
                />
              </div>
            )}

            {/* STEP 12: Preferences */}
            {step === 12 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-white text-lg">Resume Formatting & Styling</h3>
                
                {/* Layout Style */}
                <div>
                  <span className="text-xs text-gray-400 font-semibold block mb-2">TEMPLATE DESIGN</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'ats', name: 'ATS Professional', desc: 'Single column, highly scannable' },
                      { key: 'modern', name: 'Modern Tech', desc: 'Sleek spacing, bold headers' },
                      { key: 'minimal', name: 'Minimal Grid', desc: 'Compact layout, clean dividers' },
                      { key: 'executive', name: 'Executive Elegance', desc: 'Classic layout, heavy fonts' },
                    ].map(style => (
                      <button
                        key={style.key}
                        onClick={() => setForm(p => ({ ...p, preferences: { ...p.preferences, style: style.key as any } }))}
                        className={`p-3 rounded-xl border text-left transition-all
                          ${form.preferences.style === style.key
                            ? 'bg-violet-600/10 border-violet-500 text-violet-300'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                      >
                        <h4 className="font-semibold text-xs text-white">{style.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font & Colors */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-850 pt-4">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block mb-2">FONT FAMILY</span>
                    <div className="flex gap-2">
                      {['serif', 'sans', 'mono'].map(font => (
                        <button
                          key={font}
                          onClick={() => setForm(p => ({ ...p, preferences: { ...p.preferences, fontFamily: font as any } }))}
                          className={`flex-1 py-1.5 rounded border text-xs capitalize
                            ${form.preferences.fontFamily === font
                              ? 'bg-violet-900/30 border-violet-700 text-white'
                              : 'bg-gray-950 border-gray-800 text-gray-400'
                            }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block mb-2">ACCENT COLOR</span>
                    <div className="flex gap-3 items-center">
                      {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                        <button
                          key={color}
                          onClick={() => setForm(p => ({ ...p, preferences: { ...p.preferences, accentColor: color } }))}
                          className={`w-6 h-6 rounded-full border transition-all
                            ${form.preferences.accentColor === color ? 'scale-125 border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 13: Job Description */}
            {step === 13 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Job Target Selection</h3>
                <p className="text-xs text-gray-500">Paste target job details so Gemini optimizes keywords.</p>
                <textarea
                  value={form.jobDescription}
                  onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
                  placeholder="Paste the target job description or requirements here..."
                  rows={8}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
                />
              </div>
            )}

            {/* STEP 14: AI Enhancements */}
            {step === 14 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">AI Optimizations</h3>
                <p className="text-xs text-gray-500">Select which enhancements the CTO Agent should apply automatically.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'summary', name: '✔ Generate Professional Summary', desc: 'Pre-seeds a strong tailored introduction.' },
                    { id: 'experience', name: '✔ Rewrite Experience Bullets', desc: 'Uses strong action verbs and metrics.' },
                    { id: 'projects', name: '✔ Rewrite Projects Details', desc: 'Adds clarity and highlights tech stacks.' },
                    { id: 'ats', name: '✔ ATS Optimization', desc: 'Naturally injects missing keywords.' },
                  ].map(feat => (
                    <div key={feat.id} className="p-3 bg-gray-950 border border-gray-850 rounded-xl flex items-start gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-1 rounded border-gray-800 bg-gray-900 text-violet-600 focus:ring-0"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-white">{feat.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 15: Review & Verify */}
            {step === 15 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Final Review</h3>
                <div className="bg-gray-950 border border-gray-850 p-4 rounded-xl text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-medium text-white">{form.name || 'Not filled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Role:</span>
                    <span className="font-medium text-white">{form.targetRole || 'Not filled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contact Email:</span>
                    <span className="font-medium text-white">{form.email || 'Not filled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pref Template:</span>
                    <span className="font-medium text-white uppercase">{form.preferences.style} Layout</span>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-xs">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons inside wizard wrapper */}
            <div className="flex justify-between items-center mt-6 border-t border-gray-850 pt-4">
              {step > 1 ? (
                <button
                  onClick={prev}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-300 font-semibold rounded-lg text-sm transition-all"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 15 ? (
                <button
                  onClick={next}
                  disabled={
                    (step === 2 && (!form.name || !form.email)) ||
                    (step === 3 && !form.targetRole)
                  }
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-850 disabled:text-gray-600 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-violet-600/20"
                >
                  Next step →
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      Crafting Resume...
                    </>
                  ) : (
                    '✨ Compile Premium Resume'
                  )}
                </button>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ─── RESUME PREVIEW PANEL ────────────────────────────────────────── */
        <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Edit Profile Details
            </button>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ATS Score: {resume.match_score}/100
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume Page Sheet */}
            <div className="lg:col-span-2 bg-white text-gray-900 shadow-2xl rounded-xl p-8 font-serif" id="resume-sheet">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-900 pb-4 mb-5">
                <h1 className="text-3xl font-bold tracking-tight">{resume.name}</h1>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
                  {resume.contact.email && <span>{resume.contact.email}</span>}
                  {resume.contact.phone && <span>{resume.contact.phone}</span>}
                  {resume.contact.location && <span>{resume.contact.location}</span>}
                  {resume.contact.linkedin && <span>{resume.contact.linkedin}</span>}
                  {resume.contact.github && <span>{resume.contact.github}</span>}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <section className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-1.5">
                    Summary
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">{resume.summary}</p>
                </section>
              )}

              {/* Experience */}
              {resume.experience && resume.experience.length > 0 && (
                <section className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">
                    Experience
                  </h3>
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-gray-900">{exp.title}</h4>
                        <span className="text-[10px] text-gray-500">{exp.duration}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 mb-1">{exp.company} • {exp.location}</p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {exp.bullets.map((b, j) => (
                          <li key={j} className="text-[11px] text-gray-700 leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              {/* Skills */}
              {resume.skills && (
                <section className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-1.5">
                    Skills
                  </h3>
                  <div className="space-y-0.5 text-xs text-gray-700">
                    <p><span className="font-semibold">Technical:</span> {resume.skills.technical.join(', ')}</p>
                    <p><span className="font-semibold">Tools:</span> {resume.skills.tools.join(', ')}</p>
                    <p><span className="font-semibold">Soft:</span> {resume.skills.soft.join(', ')}</p>
                  </div>
                </section>
              )}

              {/* Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <section className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">
                    Projects
                  </h3>
                  {resume.projects.map((p, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-gray-900">{p.name}</h4>
                        <span className="text-[10px] text-gray-500">{p.tech_stack.join(' • ')}</span>
                      </div>
                      <p className="text-[11px] text-gray-700 mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* AI Assistant Sidebar */}
            <div className="space-y-6">
              {/* ATS keywords tracker */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-white text-sm">ATS Keywords Match</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.ats_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-violet-950/40 border border-violet-850 text-violet-300 text-[10px] rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI action toolbar */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-white text-sm">AI Enhancements</h3>
                <p className="text-xs text-gray-500">Run extra enhancements on this compiled resume data.</p>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      const improved = await api.improveSection(
                        'summary',
                        resume.summary,
                        form.jobDescription
                      );
                      setResume((prev: ResumeData | null) => prev ? { ...prev, summary: improved.improved_content } : null);
                    }}
                    className="w-full text-left py-2 px-3 bg-gray-950 border border-gray-850 rounded-lg text-xs hover:border-violet-500 transition-all font-semibold"
                  >
                    ✨ Polish Summary Bullets
                  </button>
                  <button
                    onClick={async () => {
                      const letter = await api.generateCoverLetter(
                        form.jobDescription,
                        resume,
                        'Target Organization'
                      );
                      alert(`--- GENERATED COVER LETTER ---\n\n${letter.cover_letter}`);
                    }}
                    className="w-full text-left py-2 px-3 bg-gray-950 border border-gray-850 rounded-lg text-xs hover:border-violet-500 transition-all font-semibold"
                  >
                    ✉️ Generate Tailored Cover Letter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
