import os
import urllib.request
import zipfile
import shutil

local_app_data = os.environ.get('LOCALAPPDATA', 'C:\\Users\\Sai Moulika\\AppData\\Local')
node_dir = os.path.join(local_app_data, 'nodejs')
zip_path = os.path.join(os.environ.get('TEMP', '.'), 'node-v20.18.0-win-x64.zip')
url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip'

print(f"Downloading Node.js from {url}...")
urllib.request.urlretrieve(url, zip_path)
print("Download complete. Extracting...")

extract_dir = os.path.join(os.environ.get('TEMP', '.'), 'node_extract')
if os.path.exists(extract_dir):
    shutil.rmtree(extract_dir)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)

inner_folder = os.path.join(extract_dir, 'node-v20.18.0-win-x64')
os.makedirs(node_dir, exist_ok=True)

for item in os.listdir(inner_folder):
    s = os.path.join(inner_folder, item)
    d = os.path.join(node_dir, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

print("Node.js portable setup complete!")
print("Node binary path:", os.path.join(node_dir, 'node.exe'))
