from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Doctor, Patient, Consultation, Message, Appointment
from datetime import datetime

consultation_bp = Blueprint("consultation", __name__)

@consultation_bp.route("/start", methods=["POST"])
@jwt_required()
def start_consultation():
    """Start a new consultation"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    data = request.get_json()
    required_fields = ["doctor_id", "consultation_type"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    doctor = Doctor.query.get(data["doctor_id"])
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    if not doctor.is_available:
        return jsonify({"error": "Doctor is not available"}), 400

    # Get patient profile
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        patient_id = patient.id
    else:
        # If doctor starts consultation, need patient_id
        if "patient_id" not in data:
            return jsonify({"error": "Patient ID required"}), 400
        patient = Patient.query.get(data["patient_id"])
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        patient_id = patient.id

    # Check if there's an associated appointment
    appointment_id = data.get("appointment_id")
    if appointment_id:
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.patient_id != patient_id or appointment.doctor_id != data["doctor_id"]:
            return jsonify({"error": "Invalid appointment"}), 400

    new_consultation = Consultation(
        patient_id=patient_id,
        doctor_id=data["doctor_id"],
        appointment_id=appointment_id,
        consultation_type=data["consultation_type"],
        status="active"
    )

    db.session.add(new_consultation)
    db.session.commit()

    return jsonify({
        "message": "Consultation started successfully",
        "consultation_id": new_consultation.id
    }), 201

@consultation_bp.route("/<int:consultation_id>/end", methods=["PUT"])
@jwt_required()
def end_consultation(consultation_id):
    """End a consultation"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    consultation = Consultation.query.get(consultation_id)

    if not consultation:
        return jsonify({"error": "Consultation not found"}), 404

    # Check if user has access
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and consultation.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        has_access = doctor and consultation.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    if consultation.status != "active":
        return jsonify({"error": "Consultation is not active"}), 400

    data = request.get_json()
    consultation.status = "completed"
    consultation.end_time = datetime.utcnow()
    consultation.diagnosis = data.get("diagnosis")
    consultation.prescription = data.get("prescription")
    consultation.notes = data.get("notes")

    db.session.commit()
    return jsonify({"message": "Consultation ended successfully"})

@consultation_bp.route("/my-consultations", methods=["GET"])
@jwt_required()
def get_my_consultations():
    """Get consultations for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        consultations = Consultation.query.filter_by(patient_id=patient.id).all()
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        consultations = Consultation.query.filter_by(doctor_id=doctor.id).all()
    else:
        return jsonify({"error": "Invalid user role"}), 403

    result = []
    for consultation in consultations:
        result.append({
            "id": consultation.id,
            "start_time": consultation.start_time.isoformat(),
            "end_time": consultation.end_time.isoformat() if consultation.end_time else None,
            "status": consultation.status,
            "consultation_type": consultation.consultation_type,
            "diagnosis": consultation.diagnosis,
            "prescription": consultation.prescription,
            "notes": consultation.notes,
            "doctor": {
                "id": consultation.doctor.id,
                "name": consultation.doctor.name,
                "specialization": consultation.doctor.specialization
            } if current_user.role == "patient" else None,
            "patient": {
                "id": consultation.patient.id,
                "name": consultation.patient.name
            } if current_user.role == "doctor" else None
        })

    return jsonify(result)

@consultation_bp.route("/<int:consultation_id>/messages", methods=["POST"])
@jwt_required()
def send_message(consultation_id):
    """Send a message in a consultation"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    consultation = Consultation.query.get(consultation_id)

    if not consultation:
        return jsonify({"error": "Consultation not found"}), 404

    # Check if user has access
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and consultation.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        has_access = doctor and consultation.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    if consultation.status != "active":
        return jsonify({"error": "Consultation is not active"}), 400

    data = request.get_json()
    if "message" not in data:
        return jsonify({"error": "Message is required"}), 400

    new_message = Message(
        consultation_id=consultation_id,
        sender_id=current_user.id,
        message=data["message"],
        message_type=data.get("message_type", "text")
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify({
        "message": "Message sent successfully",
        "message_id": new_message.id
    }), 201

@consultation_bp.route("/<int:consultation_id>/messages", methods=["GET"])
@jwt_required()
def get_messages(consultation_id):
    """Get messages for a consultation"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    consultation = Consultation.query.get(consultation_id)

    if not consultation:
        return jsonify({"error": "Consultation not found"}), 404

    # Check if user has access
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and consultation.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        has_access = doctor and consultation.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    messages = Message.query.filter_by(consultation_id=consultation_id).order_by(Message.timestamp).all()

    result = []
    for message in messages:
        sender = User.query.get(message.sender_id)
        result.append({
            "id": message.id,
            "message": message.message,
            "timestamp": message.timestamp.isoformat(),
            "message_type": message.message_type,
            "sender": {
                "id": sender.id,
                "username": sender.username,
                "role": sender.role
            }
        })

    return jsonify(result)

@consultation_bp.route("/active", methods=["GET"])
@jwt_required()
def get_active_consultations():
    """Get active consultations for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        consultations = Consultation.query.filter_by(
            patient_id=patient.id,
            status="active"
        ).all()
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        consultations = Consultation.query.filter_by(
            doctor_id=doctor.id,
            status="active"
        ).all()
    else:
        return jsonify({"error": "Invalid user role"}), 403

    result = []
    for consultation in consultations:
        result.append({
            "id": consultation.id,
            "start_time": consultation.start_time.isoformat(),
            "consultation_type": consultation.consultation_type,
            "doctor": {
                "id": consultation.doctor.id,
                "name": consultation.doctor.name
            } if current_user.role == "patient" else None,
            "patient": {
                "id": consultation.patient.id,
                "name": consultation.patient.name
            } if current_user.role == "doctor" else None
        })

    return jsonify(result)
