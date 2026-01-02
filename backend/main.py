from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
import re
from typing import List, Dict

# Environment değişkenlerini yükle
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# API Key kontrolü
if not api_key:
    print("⚠️ UYARI: GEMINI_API_KEY bulunamadı! Render Environment Variables ayarlarını kontrol et.")
else:
    genai.configure(api_key=api_key)

app = FastAPI()

# --- CORS AYARLARI ---
# Verdiğin Frontend linki buraya eklendi.
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://smart-contract-auditor-wm14.onrender.com",  # <-- Senin Frontend Linkin
    "https://smart-contract-auditor-wm14.onrender.com/"  # Slash ile biten versiyonu da garanti olsun
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- VERİ MODELLERİ ---
class CodeRequest(BaseModel):
    code: str
    user_id: str

class ImproveRequest(BaseModel):
    original_code: str
    issues: str
    user_id: str

# Basit bellek içi veritabanı (Context için)
user_contexts: Dict[str, List[str]] = {}

# --- YARDIMCI FONKSİYONLAR ---
def clean_gemini_output(text: str):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return match.group(0)
    return text

# --- ENDPOINTLER ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend Calisiyor! Baglanti basarili."}

@app.post("/analyze")
async def analyze_code_endpoint(req: CodeRequest):
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
    try:
        # Model ismi: gemini-1.5-flash (En kararlı sürüm)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        raw = response.text
        cleaned = clean_gemini_output(raw)
        result = json.loads(cleaned)
    except Exception as e:
        print("❌ Model Error:", e)
        result = {"status": "Error", "risk_score": 0, "issues": [{"issue": "AI Service Error", "risk": "High", "solution": "Check backend logs", "line": 0}]}

    # Context güncelle
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
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        improved_code = response.text.strip() if response.text else "// Could not generate improved code"
    except Exception as e:
        improved_code = f"// Error generating code: {str(e)}"

    # Context güncelle
    context_history.append({
        "type": "improve",
        "original_code": req.original_code,
        "issues": issues_list,
        "improved_code": improved_code
    })
    user_contexts[req.user_id] = context_history

    return {"improved_code": improved_code}
