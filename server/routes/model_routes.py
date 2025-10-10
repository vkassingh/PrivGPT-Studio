from flask import Blueprint, jsonify, request
from erver.services.ollama_services import get_available_models

model_bp=Blueprint('model_bp', __name__)

@model_bp.route("/models")
def models():
    """
    Returns available local and cloud models.

    Returns:
    JSON: Dictionary with local_models and cloud_models keys.
    """

    local_models = get_available_models()
    cloud_models = ["gemini"]
    return jsonify({
        "local_models": local_models,
        "cloud_models": cloud_models,
    })

select_model_bp = Blueprint('select_model_bp', __name__)
@select_model_bp.route("/select_model", methods=["POST"])
def select_model():
    """
    Selects the current model based on user input.

    Returns:
    JSON: Status of model selection.
    """

    global current_model
    current_model = request.json.get("model", "phi3")
    return jsonify({"status": "ok"})