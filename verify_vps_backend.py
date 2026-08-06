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
    print("Checking git diff and last commit on VPS disk:")
    
    # 1. Run git log on VPS to see what commit it is currently on
    stdin, stdout, stderr = ssh.exec_command("cd /home/root2/ai-resume-builder && git log -n 1 --oneline")
    print(f"Current VPS Git Commit: {stdout.read().decode().strip()}")
    
    # 2. Check if there are any uncommitted local changes on the VPS that might block git pull
    stdin, stdout, stderr = ssh.exec_command("cd /home/root2/ai-resume-builder && git status")
    print(f"\nVPS Git Status:\n{stdout.read().decode().strip()}")

    # 3. Check the content of backend/app/core/ai_service.py around get_mock_resume to see if it has our new code
    stdin, stdout, stderr = ssh.exec_command("grep -n \"_get_mock_resume\" /home/root2/ai-resume-builder/backend/app/core/ai_service.py")
    print(f"\nMock occurrences on VPS:\n{stdout.read().decode().strip()}")
    
    # 4. Check backend PM2 log tail to see if there are startup errors
    stdin, stdout, stderr = ssh.exec_command("pm2 logs resume-backend --lines 10 --nostream")
    print(f"\nPM2 backend logs:\n{stdout.read().decode().strip()}")

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
