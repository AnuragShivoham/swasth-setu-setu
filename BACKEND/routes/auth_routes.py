from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User, Doctor, Patient

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required_fields = ["username", "password", "email", "role"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create user
    hashed_pw = generate_password_hash(data["password"])
    new_user = User(
        username=data["username"],
        password=hashed_pw,
        email=data["email"],
        role=data["role"]
    )
    db.session.add(new_user)
    db.session.flush()  # Get user ID

    # Create profile based on role
    if data["role"] == "doctor":
        new_doctor = Doctor(
            user_id=new_user.id,
            name=data["username"],  # Use username as name
            specialization="General Medicine",  # Default
            license_number=f"LIC-{new_user.id:04d}",  # Generate license
            is_available=True
        )
        db.session.add(new_doctor)
    elif data["role"] == "patient":
        new_patient = Patient(
            user_id=new_user.id,
            name=data["username"],  # Use username as name
            symptoms=""
        )
        db.session.add(new_patient)

    db.session.commit()
    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.username)
    return jsonify({"token": token, "role": user.role})
