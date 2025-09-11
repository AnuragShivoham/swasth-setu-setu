from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Patient, Doctor, MedicalImage, Consultation
import os
import uuid
from werkzeug.utils import secure_filename

upload_bp = Blueprint("upload", __name__)

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads/medical_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/image", methods=["POST"])
@jwt_required()
def upload_medical_image():
    """Upload a medical image"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role not in ["patient", "doctor"]:
        return jsonify({"error": "Access denied"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > MAX_FILE_SIZE:
        return jsonify({"error": "File too large"}), 400

    # Get patient and consultation info
    data = request.form
    consultation_id = data.get('consultation_id')

    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        patient_id = patient.id
    elif current_user.role == "doctor":
        if 'patient_id' not in data:
            return jsonify({"error": "Patient ID required"}), 400
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        patient_id = patient.id

    # Validate consultation if provided
    if consultation_id:
        consultation = Consultation.query.get(consultation_id)
        if not consultation or consultation.patient_id != patient_id:
            return jsonify({"error": "Invalid consultation"}), 400

    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Generate unique filename
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    # Save file
    file.save(file_path)

    # Save to database
    medical_image = MedicalImage(
        patient_id=patient_id,
        consultation_id=consultation_id,
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.mimetype
    )

    db.session.add(medical_image)
    db.session.commit()

    return jsonify({
        "message": "Image uploaded successfully",
        "image_id": medical_image.id,
        "filename": unique_filename,
        "original_filename": original_filename
    }), 201

@upload_bp.route("/images", methods=["GET"])
@jwt_required()
def get_medical_images():
    """Get medical images for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404
        images = MedicalImage.query.filter_by(patient_id=patient.id).all()
    elif current_user.role == "doctor":
        # Doctors can see images from their consultations
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 404
        consultations = Consultation.query.filter_by(doctor_id=doctor.id).all()
        consultation_ids = [c.id for c in consultations]
        images = MedicalImage.query.filter(MedicalImage.consultation_id.in_(consultation_ids)).all()
    else:
        return jsonify({"error": "Access denied"}), 403

    result = []
    for image in images:
        result.append({
            "id": image.id,
            "filename": image.filename,
            "original_filename": image.original_filename,
            "uploaded_at": image.uploaded_at.isoformat(),
            "consultation_id": image.consultation_id,
            "ai_analysis": image.ai_analysis
        })

    return jsonify(result)

@upload_bp.route("/image/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_medical_image(image_id):
    """Delete a medical image"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()
    image = MedicalImage.query.get(image_id)

    if not image:
        return jsonify({"error": "Image not found"}), 404

    # Check access
    has_access = False
    if current_user.role == "patient":
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        has_access = patient and image.patient_id == patient.id
    elif current_user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        consultation = Consultation.query.get(image.consultation_id)
        has_access = doctor and consultation and consultation.doctor_id == doctor.id

    if not has_access:
        return jsonify({"error": "Access denied"}), 403

    # Delete file from filesystem
    if os.path.exists(image.file_path):
        os.remove(image.file_path)

    # Delete from database
    db.session.delete(image)
    db.session.commit()

    return jsonify({"message": "Image deleted successfully"})
