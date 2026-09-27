import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=KEY)

models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            models.append(m.name)
except Exception as e:
    models.append(str(e))

with open("output_models.json", "w", encoding="utf-8") as f:
    json.dump(models, f)
