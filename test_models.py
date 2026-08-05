import urllib.request, json, sys

key = 'AQ.Ab8RN6IVW194yVP5kN_DAHeQR0SjcXQwM0qPnznQIDPvHJGwcA'
models = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.5-flash'
]

payload = {
    'contents': [{'parts': [{'text': 'Hello'}]}]
}

for m in models:
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}'
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            res = json.loads(r.read())
            candidates = res.get("candidates", [])
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            print(f'Model {m}: WORKED! Response: {text}')
    except Exception as e:
        print(f'Model {m}: FAILED - {e}')
