from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Patient, Diagnosis
from datetime import datetime

patient_bp = Blueprint("patient", __name__)

@patient_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_patient_profile():
    """Get current patient's profile"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "patient":
        return jsonify({"error": "Patient access required"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    return jsonify({
        "id": patient.id,
        "name": patient.name,
        "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
        "phone": patient.phone,
        "address": patient.address,
        "medical_history": patient.medical_history,
        "symptoms": patient.symptoms,
        "email": current_user.email
    })

@patient_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_patient_profile():
    """Update patient's profile"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "patient":
        return jsonify({"error": "Patient access required"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    data = request.get_json()

    # Update user email if provided
    if "email" in data:
        # Check if email is already taken
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({"error": "Email already exists"}), 400
        current_user.email = data["email"]

    # Update patient fields
    if "name" in data:
        patient.name = data["name"]
    if "date_of_birth" in data:
        try:
            patient.date_of_birth = datetime.fromisoformat(data["date_of_birth"])
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
    if "phone" in data:
        patient.phone = data["phone"]
    if "address" in data:
        patient.address = data["address"]
    if "medical_history" in data:
        patient.medical_history = data["medical_history"]
    if "symptoms" in data:
        patient.symptoms = data["symptoms"]

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

@patient_bp.route("/diagnose", methods=["POST"])
@jwt_required()
def diagnose():
    """Get AI-powered diagnosis based on symptoms"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "patient":
        return jsonify({"error": "Patient access required"}), 403

    data = request.get_json()
    symptoms = data.get("symptoms", "").strip()

    if not symptoms:
        return jsonify({"error": "Symptoms are required"}), 400

    # Basic symptom-based diagnosis logic
    diagnosis_result = get_basic_diagnosis(symptoms)

    # Update patient's symptoms in profile
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    diagnosis_id = None
    if patient:
        patient.symptoms = symptoms

        # Save diagnosis to database
        new_diagnosis = Diagnosis(
            patient_id=patient.id,
            symptoms=symptoms,
            ai_diagnosis=diagnosis_result["diagnosis"]
        )
        db.session.add(new_diagnosis)
        db.session.commit()
        diagnosis_id = new_diagnosis.id

    return jsonify({
        "diagnosis_id": diagnosis_id,
        "symptoms": symptoms,
        "diagnosis": diagnosis_result["diagnosis"],
        "severity": diagnosis_result["severity"],
        "recommendations": diagnosis_result["recommendations"],
        "urgent": diagnosis_result["urgent"]
    })

def get_basic_diagnosis(symptoms):
    """Basic diagnosis logic based on symptoms"""
    symptoms_lower = symptoms.lower()

    # Emergency symptoms
    emergency_keywords = [
        "chest pain", "difficulty breathing", "severe headache", "unconscious",
        "severe bleeding", "heart attack", "stroke", "poisoning"
    ]

    # High priority symptoms
    high_priority_keywords = [
        "fever", "high fever", "persistent cough", "abdominal pain",
        "severe pain", "vomiting blood", "blood in stool"
    ]

    # Check for emergency
    if any(keyword in symptoms_lower for keyword in emergency_keywords):
        return {
            "diagnosis": "Potential emergency condition detected",
            "severity": "High",
            "recommendations": "Seek immediate medical attention at the nearest emergency room",
            "urgent": True
        }

    # Check for high priority
    if any(keyword in symptoms_lower for keyword in high_priority_keywords):
        return {
            "diagnosis": "Condition requires medical attention",
            "severity": "Medium-High",
            "recommendations": "Consult a doctor as soon as possible. Consider telemedicine consultation.",
            "urgent": False
        }

    # Common symptoms
    if "headache" in symptoms_lower:
        return {
            "diagnosis": "Headache - could be tension, migraine, or other causes",
            "severity": "Low-Medium",
            "recommendations": "Rest, hydrate, consider over-the-counter pain relief. If persistent, consult a doctor.",
            "urgent": False
        }

    if "cough" in symptoms_lower or "cold" in symptoms_lower:
        return {
            "diagnosis": "Respiratory symptoms - possible cold or allergy",
            "severity": "Low",
            "recommendations": "Rest, stay hydrated, consider cough syrup. Monitor symptoms.",
            "urgent": False
        }

    if "stomach" in symptoms_lower or "nausea" in symptoms_lower:
        return {
            "diagnosis": "Gastrointestinal discomfort",
            "severity": "Low-Medium",
            "recommendations": "Avoid heavy foods, stay hydrated. If persistent, consult a doctor.",
            "urgent": False
        }

    # Default response
    return {
        "diagnosis": "General symptoms detected - monitoring recommended",
        "severity": "Low",
        "recommendations": "Monitor your symptoms. If they worsen or persist, consult a healthcare professional.",
        "urgent": False
    }

@patient_bp.route("/medical-history", methods=["GET"])
@jwt_required()
def get_medical_history():
    """Get patient's medical history and past consultations"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    if current_user.role != "patient":
        return jsonify({"error": "Patient access required"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    # Get past consultations
    consultations = patient.consultations

    history = []
    for consultation in consultations:
        if consultation.status == "completed":
            history.append({
                "date": consultation.start_time.isoformat(),
                "doctor": consultation.doctor.name,
                "specialization": consultation.doctor.specialization,
                "diagnosis": consultation.diagnosis,
                "prescription": consultation.prescription,
                "notes": consultation.notes
            })

    return jsonify({
        "medical_history": patient.medical_history,
        "past_consultations": history
    })
