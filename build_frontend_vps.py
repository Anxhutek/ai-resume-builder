import sys
import subprocess

try:
    import paramiko
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
    import paramiko

sys.stdout.reconfigure(encoding='utf-8')

hostname = "168.144.189.164"
username = "root2"
password = "azmega"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(hostname, port=22, username=username, password=password, timeout=15)
    print("Step 1: Pulling latest changes on VPS...")
    stdin, stdout, stderr = ssh.exec_command("cd /home/root2/ai-resume-builder && git pull origin master")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("Step 2: Rebuilding Next.js frontend on VPS (This might take a minute)...")
    # Using larger memory limit if needed, e.g., NODE_OPTIONS="--max-old-space-size=4096"
    stdin, stdout, stderr = ssh.exec_command("cd /home/root2/ai-resume-builder/frontend && npm run build")
    
    # We must read in real-time or wait for it to finish
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    print("STDOUT:")
    print(out)
    print("STDERR:")
    print(err)
    
    print("\nStep 3: Reloading PM2 frontend process...")
    stdin, stdout, stderr = ssh.exec_command("pm2 reload resume-frontend")
    print(stdout.read().decode())
    
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
