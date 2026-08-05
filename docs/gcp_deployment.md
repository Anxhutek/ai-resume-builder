# Google Cloud Run Backend Deployment Guide

This guide details how to build and deploy the FastAPI backend to Google Cloud Run.

---

## Prerequisites

1. Install Google Cloud SDK (`gcloud`) on your machine.
2. Initialize and authenticate with your project:
   ```bash
   gcloud init
   gcloud auth login
   ```
3. Enable the required GCP APIs:
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com
   ```

---

## Deployment Steps

### 1. Create Artifact Registry Repository
Create a repository for your backend Docker image:
```bash
gcloud artifacts repositories create resume-backend-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for AI Resume Builder Backend"
```

### 2. Build and Push to Artifact Registry
Use Google Cloud Build to build and push the image automatically (no local Docker daemon required):
```bash
# Run this inside the backend/ directory
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/resume-backend-repo/backend-image:latest .
```
*(Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID)*

### 3. Deploy to Cloud Run
Deploy the backend image from the registry to Cloud Run:
```bash
gcloud run deploy ai-resume-backend \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/resume-backend-repo/backend-image:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=YOUR_GEMINI_API_KEY,ENVIRONMENT=production,DEBUG=false"
```
*(Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API Key)*

---

## Verification
Once deployed, Cloud Run will print a Service URL (e.g. `https://ai-resume-backend-xxxxxx.run.app`). You can verify it by checking the health endpoint:
```bash
curl https://ai-resume-backend-xxxxxx.run.app/health
```
This URL will then be configured in the Next.js frontend as the `NEXT_PUBLIC_API_URL`.
