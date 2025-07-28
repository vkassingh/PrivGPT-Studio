from flask import Flask, request, jsonify, send_file
import requests
from datetime import datetime
import io
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime, timedelta
import fitz

#Load environment variables from .env file
load_dotenv()

#Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Configure Gemini API using environment variable
GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# Connect MongoDB using environment variable
MONGODB_URL = os.getenv("MONGODB_URL")
app.config["MONGO_URI"] = MONGODB_URL
mongo = PyMongo(app)

# Reference to the MongoDB collection used to store chat sessions
sessions_collection = mongo.db.sessions

# Test mongodb connection
@app.route("/mongo-test")
def mongo_test():
    """
    Tests MongoDB connection by counting documents in the sessions collection.

    Returns:
    str: Success message with document count or error message.
    """

    try:
        count = mongo.db.sessions.count_documents({})
        return f"Connected to MongoDB! Session count: {count}"
    except Exception as e:
        return f"MongoDB connection failed: {str(e)}", 500

def get_available_models():
    """
    Fetches list of available local models from Ollama.

    Returns:
    list: Names of available local models.
    """
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        return sorted(set(m['name'].split(":")[0] for m in res.json().get("models", [])))
    except:
        return []

@app.route("/models")
def models():
    """
    Returns available local and cloud models.

    Returns:
    JSON: Dictionary with local_models and cloud_models keys.
    """

    local_models=get_available_models()
    cloud_models=["gemini"]
    return jsonify({
        "local_models": local_models,
        "cloud_models": cloud_models,
    })

@app.route("/select_model", methods=["POST"])
def select_model():
    """
    Selects the current model based on user input.

    Returns:
    JSON: Status of model selection.
    """

    global current_model
    current_model = request.json.get("model", "phi3")
    return jsonify({"status": "ok"})

@app.route("/chat", methods=["POST"])
def chat():
    """
    Handles user chat requests, processes messages, optional file input,
    interacts with local or cloud models, and stores conversation in MongoDB.

    Returns:
    JSON: Bot response, session ID, timestamp, and latency.
    """

    try:
        # ====== Base form data ======
        user_msg = request.form.get("message", "")
        model_type = request.form.get("model_type", "")
        model_name = request.form.get("model_name", "")
        session_id = request.form.get("session_id", "1")
        session_name = request.form.get("session_name", "")
        user_timestamp = datetime.now() - timedelta(seconds=10)

        # Mentions: fetch context
        mention_session_ids = request.form.getlist("mention_session_ids[]")
        history_context = ""
        if mention_session_ids:
            print(mention_session_ids)
            for m_id in mention_session_ids:
                if ObjectId.is_valid(m_id):
                    s = mongo.db.sessions.find_one({"_id": ObjectId(m_id)})
                    if s:
                        for m in s.get("messages", []):
                            history_context += f"{m['role']}: {m['content']}\n"
        # Handle uploaded file
        if history_context:
            combined_input = (
                f"Here is some previous conversation context that you should consider:\n"
                f"{history_context}\n\n"
                f"Now, based on the above context, here is the user's new message:\n"
                f"{user_msg}"
            )
        else:
            combined_input = user_msg
        
        # ====== File Handling (optional) ======
        uploaded_file = request.files.get("uploaded_file")
        if uploaded_file:
            if not allowed_file(uploaded_file.filename):
                return jsonify({"error": "Unsupported file type"}), 400
            if uploaded_file.filename == "":
                return jsonify({"error": "Empty file"}), 400

            file_bytes = uploaded_file.read()
            file_ext = uploaded_file.filename.rsplit(".", 1)[-1].lower()

            if model_type == "local":
                return jsonify({"error": "Selected local model does not support files"}), 400
            else:
                # Preprocess file for Gemini
                if file_ext == "pdf":
                    extracted_text = extract_text_from_pdf_bytes(file_bytes)
                    combined_input = f"{combined_input}\n\n[PDF Content Extracted]\n{extracted_text}"
                else:
                    # For image/video/etc, handle as media input
                    # Here gemini_model accepts both text + media
                    response = gemini_model.generate_content([
                        combined_input,
                        {"mime_type": uploaded_file.mimetype or "image/jpeg", "data": file_bytes}
                    ])
                    latency_ms = 0
                    bot_reply = response.text or "No reply."
                    # Save to DB (with uploaded_file info)
                    return save_and_return(session_id, session_name, model_name, user_msg, bot_reply, uploaded_file, file_bytes)

        # ====== Model Handling (text only or text+mentions) ======
        bot_reply = "No reply."
        latency_ms = 0
        if model_type == "local":
            payload = {
                "model": model_name,
                "prompt": combined_input,
                "stream": False,
            }
            try:
                latency_ms = datetime.now()
                response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=60)
                latency_ms = int((datetime.now() - latency_ms).total_seconds() * 1000)
                bot_reply = response.json().get("response", "No reply.")
            except Exception as e:
                bot_reply = f"Local model error: {str(e)}"
        else:
            try:
                if model_name == "gemini":
                    print(combined_input)
                    latency_ms = datetime.now()
                    response = gemini_model.generate_content(combined_input)
                    latency_ms = int((datetime.now() - latency_ms).total_seconds() * 1000)
                    bot_reply = response.text or "No Reply"
            except Exception as e:
                bot_reply = f"Cloud model error: {str(e)}"

        # ====== Message Format ======
        messages = [
            {"role": "user", "content": user_msg, "timestamp": user_timestamp},
            {"role": "bot", "content": bot_reply, "timestamp": datetime.now(), "model_name": model_name}
        ]

        # save chat history to DB
        if session_id != "1":
            mongo.db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$push": {"messages": {"$each": messages}}},
            )
        else:
            session_doc = {
                "session_name": session_name or "How can I help you?",
                "messages": messages,
                "created_at": datetime.now(),
            }
            inserted = mongo.db.sessions.insert_one(session_doc)
            session_id = str(inserted.inserted_id)

        return jsonify({
            "response": bot_reply,
            "session_id": session_id,
            "timestamp": messages[1]["timestamp"].isoformat(),
            "latency": latency_ms
        })

    except Exception as e:
        print("Error in /chat:", e)
        return jsonify({"error": str(e)}), 500


def save_and_return(session_id, session_name, model_name, user_msg, bot_reply, uploaded_file, file_bytes):
    """
    Saves conversation with file info and returns response JSON.

    Returns:
    JSON: Chat response and metadata.
    """
    messages = [
        {
            "role": "user",
            "content": user_msg,
            "timestamp": datetime.now() - timedelta(seconds=10),
            "uploaded_file": {
                "name": uploaded_file.filename,
                "type": uploaded_file.mimetype,
                "size": len(file_bytes),
            },
        },
        {
            "role": "bot",
            "content": bot_reply,
            "timestamp": datetime.now(),
            "model_name": model_name,
        }
    ]


    if session_id != "1":
        mongo.db.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$push": {"messages": {"$each": messages}},
                "$set": {"session_name": session_name or "How can I help you?"}
            },
        )
    else:
        session_doc = {
            "messages": messages,
            "created_at": datetime.now(),
            "session_name": session_name or "How can I help you?",
        }
        inserted = mongo.db.sessions.insert_one(session_doc)
        session_id = str(inserted.inserted_id)

    return jsonify({
        "response": bot_reply,
        "session_id": session_id,
        "timestamp": messages[1]["timestamp"].isoformat(),
        "latency": 0
    })

@app.route("/chat/history", methods=["POST"])
def chat_history():
    """
    Fetches chat history for given session IDs.

    Returns:
    JSON: List of sessions with message history.
    """
    data = request.json or {}
    id_list = data.get("session_ids", [])
    
    try:
        object_ids = [ObjectId(sid) for sid in id_list]
    except Exception as e:
        return jsonify({"error": "Invalid session ID format"}), 400

    sessions = mongo.db.sessions.find({"_id": {"$in": object_ids}}).sort("created_at", -1)

    result = []
    for session in sessions:
        session["_id"] = str(session["_id"])
        for msg in session.get("messages", []):
            msg["timestamp"] = msg["timestamp"].isoformat()
        result.append(session)
    
    return jsonify(result)

@app.route("/chat/<session_id>", methods=["GET"])
def get_session_messages(session_id):
    """
    Retrieves all messages for a specific chat session.

    Args:
    session_id (str): MongoDB ObjectId of the session.

    Returns:
    JSON: Session ID and message list or error.
    """
    try:
        session = mongo.db.sessions.find_one({"_id": ObjectId(session_id)})

        if not session:
            return jsonify({"error": "Session not found"}), 404

        # Convert timestamps to ISO format for JSON serialization
        for msg in session.get("messages", []):
            if "timestamp" in msg:
                msg["timestamp"] = msg["timestamp"].isoformat()

        return jsonify({
            "session_id": str(session["_id"]),
            "messages": session["messages"]
        })

    except Exception as e:
        return jsonify({"error": f"Invalid session ID: {str(e)}"}), 400

@app.route("/chat/rename", methods=["POST"])
def rename_session():
    """
    Renames a chat session.

    Returns:
    JSON: Status message indicating success or failure.
    """

    data = request.json or {}
    session_id = data.get("session_id")
    new_name = data.get("new_name")
    
    if not session_id or not new_name:
        return jsonify({"error": "Missing session_id or new_name"}), 400

    try:
        result = mongo.db.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"session_name": new_name}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Session not found"}), 404

        return jsonify({"message": "Session renamed successfully"})

    except Exception as e:
        return jsonify({"error": f"Failed to rename session: {str(e)}"}), 500
    
@app.route("/clear", methods=["POST"])
def clear():
    """
    Clears all messages from a chat session.

    Returns:
    JSON: Status and session ID.
    """
    data = request.get_json()
    session_id = data.get("session_id")

    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400

    try:
        result = mongo.db.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"messages": []}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Session not found"}), 404

        return jsonify({"status": "cleared", "session_id": session_id})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

for m in genai.list_models():
    print(m.name, m.supported_generation_methods)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'pdf', 'mp3'}

def allowed_file(filename):
    """
    Checks if uploaded file has an allowed extension.

    Args:
    filename (str): Name of the uploaded file.

    Returns:
    bool: True if file extension is allowed, else False.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Extracts text content from PDF file bytes.

    Args:
    file_bytes (bytes): PDF file content.

    Returns:
    str: Extracted plain text from PDF.
    """

    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
            text += "\n\n"
    return text.strip()

@app.route("/chat/delete/<session_id>", methods=["DELETE"])
def delete_chat(session_id):
    """
    Deletes an entire chat session.

    Args:
    session_id (str): MongoDB ObjectId of the session.

    Returns:
    JSON: Status message indicating success or failure.
    """
    try:
        # Validate session_id
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id"}), 400

        # Attempt to delete
        result = mongo.db.sessions.delete_one({"_id": ObjectId(session_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Chat session not found"}), 404

        return jsonify({"status": "success", "message": "Chat deleted successfully"})
    except Exception as e:
        print("Error in /chat/delete:", e)
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)