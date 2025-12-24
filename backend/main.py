from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
import re
from typing import List, Dict

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY is missing! Create a .env file with your key.")

genai.configure(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    user_id: str  # user bazlı context için

class ImproveRequest(BaseModel):
    original_code: str
    issues: str  # JSON string
    user_id: str

# In-memory context storage
user_contexts: Dict[str, List[str]] = {}

def clean_gemini_output(text: str):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return match.group(0)
    return text

@app.post("/analyze")
async def analyze_code_endpoint(req: CodeRequest):
    # Kullanıcı contextini al
    context_history = user_contexts.get(req.user_id, [])

    prompt = f"""
You are a professional blockchain smart contract auditor.
Here is the previous context (previous analyses and improvements):
{json.dumps(context_history, indent=2)}

Analyze the following Solidity code for security vulnerabilities:

Code:
{req.code}

### OUTPUT FORMAT (MUST BE STRICT JSON)
{{
    "status": "Safe / Warning / Critical",
    "risk_score": number_from_0_to_100,
    "issues": [
        {{"issue": "Short vulnerability name", "risk": "Low / Medium / High", "solution": "How to fix", "line": line_number_or_null}}
    ]
}}
"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    raw = response.text
    cleaned = clean_gemini_output(raw)

    try:
        result = json.loads(cleaned)
    except Exception as e:
        print("❌ JSON parse error:", e)
        print("Model returned:", raw)
        result = {"status": "Error", "risk_score": 0, "issues": []}

    # Context’e ekle
    context_history.append({
        "type": "analyze",
        "code": req.code,
        "result": result
    })
    user_contexts[req.user_id] = context_history

    return result

@app.post("/improve")
async def improve_code_endpoint(req: ImproveRequest):
    try:
        issues_list = json.loads(req.issues)
    except Exception as e:
        return {"error": "Invalid JSON in issues", "details": str(e)}

    # Kullanıcı contextini al
    context_history = user_contexts.get(req.user_id, [])

    prompt = f"""
You are a professional blockchain smart contract auditor and Solidity developer.
Here is the previous context (previous analyses and improvements):
{json.dumps(context_history, indent=2)}

Here is the original code to improve:

{req.original_code}

The analysis returned the following issues:
{json.dumps(issues_list, indent=2)}

Please rewrite the Solidity code fixing ALL the above issues.
Return **only** the corrected code, nothing else.
"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    improved_code = response.text.strip() if response.text else "// Could not generate improved code"

    # Context’e ekle
    context_history.append({
        "type": "improve",
        "original_code": req.original_code,
        "issues": issues_list,
        "improved_code": improved_code
    })
    user_contexts[req.user_id] = context_history

    return {"improved_code": improved_code}
