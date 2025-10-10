from flask import Blueprint
from server import mongo

db_bp = Blueprint('db', __name__)

@db_bp.route("/mongo-test")
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