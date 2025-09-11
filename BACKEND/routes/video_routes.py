from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Consultation, VideoSession
import uuid
from datetime import datetime

video_bp = Blueprint("video", __name__)

@video_bp.route("/session/start", methods=["POST"])
@jwt_required()
def start_video_session():
    """Start a new video session for a consultation"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role not in ["patient", "doctor"]:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    consultation_id = data.get("consultation_id")

    if not consultation_id:
        return jsonify({"error": "Consultation ID is required"}), 400

    consultation = db.session.get(Consultation, consultation_id)
    if not consultation:
        return jsonify({"error": "Consultation not found"}), 404

    # Check if user is part of the consultation
    if current_user.role == "patient":
        patient = consultation.patient
        if patient.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403
    elif current_user.role == "doctor":
        doctor = consultation.doctor
        if doctor.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

    # Check if session already exists
    existing_session = VideoSession.query.filter_by(consultation_id=consultation_id, status="active").first()
    if existing_session:
        return jsonify({
            "message": "Video session already active",
            "session_token": existing_session.session_token,
            "session_id": existing_session.id
        })

    # Create new session
    session_token = str(uuid.uuid4())
    new_session = VideoSession(
        consultation_id=consultation_id,
        session_token=session_token,
        status="active",
        start_time=datetime.utcnow(),
        participants=f"[{current_user.id}]"
    )

    db.session.add(new_session)
    db.session.commit()

    return jsonify({
        "message": "Video session started",
        "session_token": session_token,
        "session_id": new_session.id
    }), 201

@video_bp.route("/session/join/<session_token>", methods=["POST"])
@jwt_required()
def join_video_session(session_token):
    """Join an existing video session"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    session = VideoSession.query.filter_by(session_token=session_token).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.status != "active":
        return jsonify({"error": "Session is not active"}), 400

    consultation = session.consultation

    # Check if user is part of the consultation
    if current_user.role == "patient":
        patient = consultation.patient
        if patient.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403
    elif current_user.role == "doctor":
        doctor = consultation.doctor
        if doctor.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

    # Update participants
    participants = session.participants or "[]"
    import json
    try:
        participants_list = json.loads(participants)
    except:
        participants_list = []

    if current_user.id not in participants_list:
        participants_list.append(current_user.id)
        session.participants = json.dumps(participants_list)
        db.session.commit()

    return jsonify({
        "message": "Joined video session",
        "session_id": session.id,
        "consultation_id": consultation.id
    })

@video_bp.route("/session/end/<int:session_id>", methods=["POST"])
@jwt_required()
def end_video_session(session_id):
    """End a video session"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    session = db.session.get(VideoSession, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    consultation = session.consultation

    # Check if user is part of the consultation
    if current_user.role == "patient":
        patient = consultation.patient
        if patient.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403
    elif current_user.role == "doctor":
        doctor = consultation.doctor
        if doctor.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

    session.status = "ended"
    session.end_time = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Video session ended"})

@video_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_video_sessions():
    """Get video sessions for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role == "patient":
        consultations = Consultation.query.filter_by(patient_id=current_user.patient_profile.id).all()
    elif current_user.role == "doctor":
        consultations = Consultation.query.filter_by(doctor_id=current_user.doctor_profile.id).all()
    else:
        return jsonify({"error": "Access denied"}), 403

    consultation_ids = [c.id for c in consultations]
    sessions = VideoSession.query.filter(VideoSession.consultation_id.in_(consultation_ids)).order_by(VideoSession.created_at.desc()).all()

    result = []
    for session in sessions:
        result.append({
            "id": session.id,
            "consultation_id": session.consultation_id,
            "session_token": session.session_token,
            "status": session.status,
            "start_time": session.start_time.isoformat() if session.start_time else None,
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "created_at": session.created_at.isoformat(),
            "participants": session.participants
        })

    return jsonify(result)
