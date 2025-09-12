from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User
from json_storage import register_user, authenticate_user, get_user_by_username

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required_fields = ["username", "password", "email", "role"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    success, result = register_user(data["username"], data["password"], data["email"], data["role"])
    if not success:
        return jsonify({"error": result}), 400

    return jsonify({"message": "User registered successfully", "user_id": result}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    success, user = authenticate_user(data["username"], data["password"])
    if not success:
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user["username"])
    return jsonify({"token": token, "role": user["role"]})
