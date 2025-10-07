from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Doctor, Patient, Appointment
from datetime import datetime

appointment_bp = Blueprint("appointment", __name__)

@appointment_bp.route("/book", methods=["POST"])
@jwt_required()
def book_appointment():
    """Book a new appointment"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "patient":
        return jsonify({"error": "Patient access required"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    data = request.get_json()
    required_fields = ["doctor_id", "appointment_date", "reason"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    doctor = Doctor.query.get(data["doctor_id"])
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    if not doctor.is_available:
        return jsonify({"error": "Doctor is not available"}), 400

    try:
        appointment_date = datetime.fromisoformat(data["appointment_date"])
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Check if slot is available (basic check - can be enhanced)
    existing_appointment = Appointment.query.filter_by(
        doctor_id=data["doctor_id"],
        appointment_date=appointment_date
    ).first()

    if existing_appointment:
        return jsonify({"error": "Time slot not available"}), 400

    new_appointment = Appointment(
        patient_id=patient.id,
        doctor_id=data["doctor_id"],
        appointment_date=appointment_date,
        reason=data["reason"],
        notes=data.get("notes")
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({
        "message": "Appointment booked successfully",
        "appointment_id": new_appointment.id
    }), 201

@appointment_bp.route("/my-appointments", methods=["GET"])
@jwt_required()
def get_my_appointments():
    """Get appointments for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        appointments = Appointment.query.filter_by(patient_id=patient.id).all()
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        appointments = Appointment.query.filter_by(doctor_id=doctor.id).all()
    else:
        return jsonify({"error": "Invalid user role"}), 403

    result = []
    for appointment in appointments:
        result.append({
            "id": appointment.id,
            "appointment_date": appointment.appointment_date.isoformat(),
            "status": appointment.status,
            "reason": appointment.reason,
            "notes": appointment.notes,
            "doctor": {
                "id": appointment.doctor.id,
                "name": appointment.doctor.name,
                "specialization": appointment.doctor.specialization
            } if current_user.role == "patient" else None,
            "patient": {
                "id": appointment.patient.id,
                "name": appointment.patient.name
            } if current_user.role == "doctor" else None
        })

    return jsonify(result)

@appointment_bp.route("/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment(appointment_id):
    """Get specific appointment details"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    # Check if user has access to this appointment
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and appointment.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        has_access = doctor and appointment.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "id": appointment.id,
        "appointment_date": appointment.appointment_date.isoformat(),
        "status": appointment.status,
        "reason": appointment.reason,
        "notes": appointment.notes,
        "doctor": {
            "id": appointment.doctor.id,
            "name": appointment.doctor.name,
            "specialization": appointment.doctor.specialization
        },
        "patient": {
            "id": appointment.patient.id,
            "name": appointment.patient.name
        }
    })

@appointment_bp.route("/<int:appointment_id>/status", methods=["PUT"])
@jwt_required()
def update_appointment_status(appointment_id):
    """Update appointment status"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    data = request.get_json()
    if "status" not in data:
        return jsonify({"error": "Status is required"}), 400

    new_status = data["status"]
    valid_statuses = ["scheduled", "completed", "cancelled"]

    if new_status not in valid_statuses:
        return jsonify({"error": "Invalid status"}), 400

    # Check permissions
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient or appointment.patient_id != patient.id:
            return jsonify({"error": "Access denied"}), 403
        # Patients can only cancel
        if new_status != "cancelled":
            return jsonify({"error": "Patients can only cancel appointments"}), 403
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            return jsonify({"error": "Access denied"}), 403
    else:
        return jsonify({"error": "Invalid user role"}), 403

    appointment.status = new_status
    if new_status == "completed":
        appointment.notes = data.get("notes", appointment.notes)

    db.session.commit()
    return jsonify({"message": "Appointment status updated successfully"})

@appointment_bp.route("/<int:appointment_id>/notes", methods=["PUT"])
@jwt_required()
def update_appointment_notes(appointment_id):
    """Update appointment notes"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    data = request.get_json()
    if "notes" not in data:
        return jsonify({"error": "Notes are required"}), 400

    # Check if user has access
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and appointment.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        has_access = doctor and appointment.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    appointment.notes = data["notes"]
    db.session.commit()
    return jsonify({"message": "Notes updated successfully"})
