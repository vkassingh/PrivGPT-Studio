import os
import google.generativeai as genai
import sys
from Server import create_app
from flask_cors import CORS

# Add parent directory to Python path to allow Server module import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize Flask app
app = create_app()
CORS(app, origins=["https://privgpt-studio.vercel.app", "http://127.0.0.1:5000"])

# list available models
for m in genai.list_models():
    print(m.name, m.supported_generation_methods)
    
# start server
if __name__ == "__main__":
    app.run()