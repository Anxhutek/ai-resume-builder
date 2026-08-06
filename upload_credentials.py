import sys
import subprocess
import os

try:
    import paramiko
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
    import paramiko

sys.stdout.reconfigure(encoding='utf-8')

# Local JSON key file path
local_key_path = r"C:\Users\anshu\Downloads\project-1216ad02-cf4a-4c3a-ad8-67e64062636c.json"

if not os.path.exists(local_key_path):
    print(f"Error: Local file not found at {local_key_path}")
    sys.exit(1)

with open(local_key_path, 'r', encoding='utf-8') as f:
    key_content = f.read()

hostname = "168.144.189.164"
username = "root2"
password = "azmega"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(hostname, port=22, username=username, password=password, timeout=15)
    print("Connected to VPS.")
    
    # 1. Write key content to /home/root2/google-credentials.json
    sftp = ssh.open_sftp()
    with sftp.file('/home/root2/google-credentials.json', 'w') as f:
        f.write(key_content)
    sftp.close()
    print("Successfully uploaded Google Cloud credentials JSON to VPS at /home/root2/google-credentials.json")
    
    # 2. Make it readable only by root2 for security
    ssh.exec_command("chmod 600 /home/root2/google-credentials.json")
    
    # 3. Add to system environment variables in /home/root2/.bashrc so any shell session has it!
    print("Configuring system-wide environment variables for root2...")
    cmd = """grep -q "GOOGLE_APPLICATION_CREDENTIALS" /home/root2/.bashrc || echo 'export GOOGLE_APPLICATION_CREDENTIALS="/home/root2/google-credentials.json"' >> /home/root2/.bashrc"""
    ssh.exec_command(cmd)
    
    # 4. Enable Vertex AI platform service using gcloud on the VPS!
    # First authenticate gcloud on VPS with this service account
    print("Authenticating gcloud CLI on VPS using the credentials file...")
    stdin, stdout, stderr = ssh.exec_command(
        "gcloud auth activate-service-account --key-file=/home/root2/google-credentials.json"
    )
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("Enabling Vertex AI API (aiplatform.googleapis.com) on GCP Project...")
    # This will enable the service platform
    stdin, stdout, stderr = ssh.exec_command(
        "gcloud services enable aiplatform.googleapis.com --project=project-1216ad02-cf4a-4c3a-ad8"
    )
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("\nGoogle Cloud global environment variable configured!")
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
