import os
import sys
import google.generativeai as genai
from flask_cors import CORS
from Server import create_app

# Add parent directory to Python path to allow Server module import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize Flask app
app = create_app()

# Enable CORS for all routes and handle preflight requests
CORS(
    app,
    origins=[
        "https://privgpt-studio.vercel.app",
        "http://127.0.0.1:5000"
    ],
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# Optional: handle preflight OPTIONS requests explicitly (for Vercel)
from flask import request
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()
        return resp

# List available models (optional)
for m in genai.list_models():
    print(m.name, m.supported_generation_methods)

# Start server
if __name__ == "__main__":
    app.run()
