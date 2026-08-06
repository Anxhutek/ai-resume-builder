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
    print("Reading full PM2 error logs for resume-backend:")
    stdin, stdout, stderr = ssh.exec_command("tail -n 100 /home/root2/.pm2/logs/resume-backend-error.log")
    print(stdout.read().decode())
    
    print("\nReading full PM2 out logs for resume-backend:")
    stdin, stdout, stderr = ssh.exec_command("tail -n 100 /home/root2/.pm2/logs/resume-backend-out.log")
    print(stdout.read().decode())
    
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
