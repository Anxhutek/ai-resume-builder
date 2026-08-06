import subprocess
import os
import sys

# Local JSON key file path
local_key_path = r"C:\Users\anshu\Downloads\project-1216ad02-cf4a-4c3a-ad8-67e64062636c.json"

if not os.path.exists(local_key_path):
    print(f"Error: Local file not found at {local_key_path}")
    sys.exit(1)

project_id = "project-1216ad02-cf4a-4c3a-ad8"

try:
    print("Step 1: Authenticating local gcloud client with service account key...")
    cmd_auth = f'gcloud auth activate-service-account --key-file="{local_key_path}"'
    subprocess.check_call(cmd_auth, shell=True)
    print("Local gcloud authenticated successfully!")
    
    print("\nStep 2: Enabling Vertex AI API on GCP Project...")
    cmd_enable = f'gcloud services enable aiplatform.googleapis.com --project={project_id}'
    subprocess.check_call(cmd_enable, shell=True)
    print("\n🎉 Vertex AI API enabled successfully on GCP Console!")
    
except Exception as e:
    print(f"\nError running local gcloud command: {e}")
    print("Please make sure Google Cloud SDK (gcloud) is installed on your Windows machine.")
