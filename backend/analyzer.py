from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key=os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key)

def improve_code(code, issues):
    prompt = f"""
Aşağıdaki Solidity kodunda şu güvenlik açıkları tespit edildi:

{issues}

Bu açıkları düzelt ve en güvenli hâline getir.
Sadece DÜZELTİLMİŞ kodu döndür. Açıklama ekleme.

--- ORİJİNAL KOD ---
{code}
"""

    response = client.models.generate_content(
        model="gemini-pro",
        contents=prompt
    )

    return response.text
