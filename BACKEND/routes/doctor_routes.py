from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User, Doctor, Patient
from datetime import datetime

doctor_bp = Blueprint("doctor", __name__)

@doctor_bp.route("/register", methods=["POST"])
@jwt_required()
def register_doctor():
    """Register a new doctor (admin only)"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    required_fields = ["username", "password", "email", "name", "specialization", "license_number"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400
    if Doctor.query.filter_by(license_number=data["license_number"]).first():
        return jsonify({"error": "License number already exists"}), 400

    # Create user
    hashed_pw = generate_password_hash(data["password"])
    new_user = User(
        username=data["username"],
        password=hashed_pw,
        email=data["email"],
        role="doctor"
    )
    db.session.add(new_user)
    db.session.flush()  # Get user ID

    # Create doctor profile
    new_doctor = Doctor(
        user_id=new_user.id,
        name=data["name"],
        specialization=data["specialization"],
        license_number=data["license_number"],
        experience_years=data.get("experience_years"),
        phone=data.get("phone"),
        bio=data.get("bio")
    )
    db.session.add(new_doctor)
    db.session.commit()

    return jsonify({"message": "Doctor registered successfully", "doctor_id": new_doctor.id}), 201

@doctor_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_doctor_profile():
    """Get current doctor's profile"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "doctor":
        return jsonify({"error": "Doctor access required"}), 403

    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    if not doctor:
        return jsonify({"error": f"Doctor profile not found for user {current_user.username} with id {current_user.id}"}), 404

    return jsonify({
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "license_number": doctor.license_number,
        "experience_years": doctor.experience_years,
        "phone": doctor.phone,
        "bio": doctor.bio,
        "is_available": doctor.is_available
    })

@doctor_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_doctor_profile():
    """Update doctor's profile"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "doctor":
        return jsonify({"error": "Doctor access required"}), 403

    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    if not doctor:
        return jsonify({"error": "Doctor profile not found"}), 404

    data = request.get_json()
    if "name" in data:
        doctor.name = data["name"]
    if "specialization" in data:
        doctor.specialization = data["specialization"]
    if "experience_years" in data:
        doctor.experience_years = data["experience_years"]
    if "phone" in data:
        doctor.phone = data["phone"]
    if "bio" in data:
        doctor.bio = data["bio"]
    if "is_available" in data:
        doctor.is_available = data["is_available"]

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

@doctor_bp.route("/available", methods=["GET"])
def get_available_doctors():
    """Get list of available doctors"""
    doctors = Doctor.query.filter_by(is_available=True).all()
    result = []
    for doctor in doctors:
        result.append({
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization,
            "experience_years": doctor.experience_years,
            "bio": doctor.bio
        })
    return jsonify(result)

@doctor_bp.route("/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    """Get doctor by ID"""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify({
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "experience_years": doctor.experience_years,
        "bio": doctor.bio,
        "is_available": doctor.is_available
    })

@doctor_bp.route("/patients", methods=["GET"])
@jwt_required()
def get_doctor_patients():
    """Get patients assigned to current doctor"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "doctor":
        return jsonify({"error": "Doctor access required"}), 403

    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    if not doctor:
        return jsonify({"error": "Doctor profile not found"}), 404

    # Get patients through appointments
    appointments = doctor.appointments
    patients = []
    seen_patient_ids = set()

    for appointment in appointments:
        if appointment.patient_id not in seen_patient_ids:
            patient_data = {
                "id": appointment.patient.id,
                "name": appointment.patient.name,
                "phone": appointment.patient.phone,
                "symptoms": appointment.patient.symptoms
            }
            patients.append(patient_data)
            seen_patient_ids.add(appointment.patient_id)

    return jsonify(patients)

# New endpoint to fix missing doctor profiles
@doctor_bp.route("/fix-profiles", methods=["POST"])
@jwt_required()
def fix_missing_doctor_profiles():
    """Create missing doctor profiles for existing doctor users"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    doctor_users = User.query.filter_by(role="doctor").all()
    created_profiles = []
    for user in doctor_users:
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            # Create default doctor profile
            new_doctor = Doctor(
                user_id=user.id,
                name=user.username,
                specialization="General Medicine",
                license_number=f"LIC-{user.id:04d}",
                is_available=True
            )
            db.session.add(new_doctor)
            created_profiles.append(user.username)
    db.session.commit()

    return jsonify({
        "message": "Missing doctor profiles created",
        "created_profiles": created_profiles
    })
