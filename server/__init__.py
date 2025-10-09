from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from .config import Config
import google.generativeai as genai

mongo = PyMongo()
gemini_model = None


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)
    mongo.init_app(app)

    @app.route("/")
    def index():
        return "Welcome to the PrivGPT-Studio Backend!"

    # configure the gemini model
    genai.configure(api_key=Config.GEMINI_API_KEY)
    global gemini_model
    gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")

    # blueprint imports
    from Server.routes.db import db_bp
    app.register_blueprint(db_bp)
    from Server.routes.model_routes import model_bp
    app.register_blueprint(model_bp)
    from Server.routes.model_routes import select_model_bp
    app.register_blueprint(select_model_bp)
    from Server.routes.chat_routes import chat_bp
    app.register_blueprint(chat_bp)
    return app