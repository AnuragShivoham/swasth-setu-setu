from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Patient, Diagnosis
import random  # For placeholder AI response

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/diagnose", methods=["POST"])
@jwt_required()
def diagnose():
    """AI-powered diagnosis based on symptoms"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role != "patient":
        return jsonify({"error": "Only patients can request diagnosis"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    data = request.get_json()
    if "symptoms" not in data:
        return jsonify({"error": "Symptoms are required"}), 400

    symptoms = data["symptoms"]
    consultation_id = data.get("consultation_id")

    # Placeholder AI diagnosis logic
    # In a real implementation, this would call an AI service like OpenAI or a custom model
    possible_diagnoses = [
        "Common cold - Rest and hydration recommended",
        "Flu - Seek medical attention if symptoms worsen",
        "Allergies - Consider antihistamines",
        "Migraine - Rest in a dark room",
        "Gastroenteritis - Stay hydrated and rest"
    ]

    ai_diagnosis = random.choice(possible_diagnoses)
    confidence_score = round(random.uniform(0.7, 0.95), 2)  # Random confidence between 70-95%

    # Save diagnosis to database
    new_diagnosis = Diagnosis(
        patient_id=patient.id,
        consultation_id=consultation_id,
        symptoms=symptoms,
        ai_diagnosis=ai_diagnosis,
        confidence_score=confidence_score
    )

    db.session.add(new_diagnosis)
    db.session.commit()

    return jsonify({
        "diagnosis_id": new_diagnosis.id,
        "ai_diagnosis": ai_diagnosis,
        "confidence_score": confidence_score,
        "note": "This is a placeholder diagnosis. Consult a doctor for professional medical advice."
    }), 201

@ai_bp.route("/diagnoses", methods=["GET"])
@jwt_required()
def get_diagnoses():
    """Get AI diagnoses for current patient"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role != "patient":
        return jsonify({"error": "Only patients can view diagnoses"}), 403

    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({"error": "Patient profile not found"}), 404

    diagnoses = Diagnosis.query.filter_by(patient_id=patient.id).order_by(Diagnosis.created_at.desc()).all()

    result = []
    for diagnosis in diagnoses:
        result.append({
            "id": diagnosis.id,
            "symptoms": diagnosis.symptoms,
            "ai_diagnosis": diagnosis.ai_diagnosis,
            "confidence_score": diagnosis.confidence_score,
            "created_at": diagnosis.created_at.isoformat(),
            "consultation_id": diagnosis.consultation_id
        })

    return jsonify(result)
