import urllib.request, json, sys, time
sys.stdout.reconfigure(encoding='utf-8')

url = 'http://localhost:8080/api/v1/resume/generate'
payload = {
    'job_description': 'We are looking for a Senior Python Developer with 3+ years of experience in FastAPI, PostgreSQL, Docker, and cloud platforms (AWS/GCP). Must know REST APIs, CI/CD pipelines, and microservices architecture. Experience with AI/ML integration is a plus.',
    'user_info': {
        'name': 'Anshu Kumar',
        'email': 'anshu@example.com',
        'phone': '+91 98765 43210',
        'location': 'Delhi, India',
        'linkedin': 'linkedin.com/in/anxhutek',
        'github': 'github.com/Anxhutek',
        'experience': 'Software Engineer at TechCorp (2022-Present): Built REST APIs using FastAPI, deployed on AWS EC2, worked with PostgreSQL databases. Intern at StartupXYZ (2021): Developed Python scripts for data processing.',
        'education': 'B.Tech Computer Science, Delhi University, 2022, GPA: 8.2',
        'skills': 'Python, FastAPI, PostgreSQL, Docker, AWS, Git, REST APIs, React, TypeScript',
        'projects': 'AI Resume Builder: Built using FastAPI + Gemini AI + Next.js. Open source on GitHub.',
        'achievements': 'Won Google Hackathon 2024, AWS Certified Developer 2023'
    },
    'tone': 'professional'
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print('Calling Gemini 2.5 Flash... (may take 10-20s)')
start = time.time()
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        result = json.loads(r.read())
        elapsed = round(time.time() - start, 1)
        resume = result.get('resume', {})
        
        print(f'\n=== RESULT ===')
        print(f'Time taken:   {elapsed}s')
        print(f'Name:         {resume.get("name")}')
        print(f'ATS Score:    {resume.get("match_score")}/100')
        print(f'Summary:      {str(resume.get("summary", ""))[:150]}...')
        print(f'Keywords:     {resume.get("ats_keywords", [])[:6]}')
        print(f'Experience:   {len(resume.get("experience", []))} items')
        print(f'Skills Tech:  {resume.get("skills", {}).get("technical", [])[:5]}')
        print(f'Projects:     {len(resume.get("projects", []))} items')
        print(f'\nSUCCESS - Full stack working end-to-end!')
        
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'HTTP {e.code}: {body[:500]}')
except Exception as e:
    print(f'ERROR: {type(e).__name__}: {e}')
