from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed_pw = generate_password_hash(data["password"])
    user = User(username=data["username"], password=hashed_pw, role=data.get("role", "patient"))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and check_password_hash(user.password, data["password"]):
        token = create_access_token(identity={"username": user.username, "role": user.role})
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401
