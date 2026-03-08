import urllib.request
import base64
import json
import zlib

graph = open('diagram.mmd', 'r', encoding='utf-8').read()
payload = json.dumps({"code": graph, "mermaid": {"theme": "default"}})

# Mermaid.ink expects base64 URL safe without padding
b64 = base64.urlsafe_b64encode(payload.encode('utf-8')).decode('utf-8').rstrip('=')

print(f"Fetching from https://mermaid.ink/img/pako:{b64}")

try:
    req = urllib.request.Request(f"https://mermaid.ink/img/{b64}", headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open('diagram.png', 'wb') as f:
            f.write(response.read())
    print("Downloaded diagram.png successfully!")
except Exception as e:
    print("Error:", e)
