# Next.js Frontend VPS Deployment Guide

This guide describes how to deploy the Next.js frontend to a Linux VPS (Ubuntu/Debian) using Docker and Nginx.

---

## Prerequisites on VPS

Install Docker and Nginx on your VPS:
```bash
sudo apt update
sudo apt install -y docker.io nginx
```

---

## Deployment Steps (using Docker)

### 1. Build and Package
Run these commands in the `frontend` directory on your local machine to build the Docker image and save it as a tar file (or you can build it directly on your VPS by copying the code):

#### Option A: Build directly on the VPS (Recommended)
1. Push your code to GitHub.
2. SSH into your VPS, clone the repo, and navigate to the frontend directory:
   ```bash
   git clone https://github.com/Anxhutek/ai-resume-builder.git
   cd ai-resume-builder/frontend
   ```
3. Build the Docker image:
   ```bash
   sudo docker build -t resume-frontend .
   ```

#### Option B: Build locally and copy to VPS
1. Build locally:
   ```bash
   docker build -t resume-frontend .
   ```
2. Export the image to a file:
   ```bash
   docker save -o resume-frontend.tar resume-frontend
   ```
3. Transfer the file to your VPS:
   ```bash
   scp resume-frontend.tar user@your_vps_ip:/home/user/
   ```
4. Load the image on your VPS:
   ```bash
   sudo docker load -i /home/user/resume-frontend.tar
   ```

### 2. Run the Container on VPS
Run the container and expose it on port `3000`:
```bash
sudo docker run -d \
  --name resume-frontend \
  -p 3000:3000 \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_URL="https://api.ai-resume-builder.run.app" \
  resume-frontend
```
*(Replace `https://api.ai-resume-builder.run.app` with your actual FastAPI backend URL)*

---

## Configure Nginx as a Reverse Proxy

We will configure Nginx to route external requests on port 80 (HTTP) to the Next.js app running inside the container on port 3000.

1. Create a configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/resume-frontend
   ```

2. Paste the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_vps_ip;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the configuration and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/resume-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. *(Optional)* Set up SSL with Let's Encrypt Certbot:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your_domain_or_vps_ip
   ```
