from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Notification
from flask_mail import Mail, Message
from datetime import datetime

notification_bp = Blueprint("notification", __name__)

# Initialize Flask-Mail (will be configured in app.py)
mail = Mail()

@notification_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    """Get notifications for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=current_user.id)

    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).paginate(page=page, per_page=per_page)

    result = []
    for notification in notifications.items:
        result.append({
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
            "related_id": notification.related_id
        })

    return jsonify({
        "notifications": result,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": notifications.total,
            "pages": notifications.pages
        }
    })

@notification_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a notification as read"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read"})

@notification_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read for current user"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({"message": "All notifications marked as read"})

@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notification)
    db.session.commit()

    return jsonify({"message": "Notification deleted"})

@notification_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({"unread_count": count})

# Helper function to create notifications
def create_notification(user_id, title, message, notification_type="general", related_id=None):
    """Create a new notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_id=related_id
    )

    db.session.add(notification)
    db.session.commit()

    return notification

@notification_bp.route("/call-request", methods=["POST"])
@jwt_required()
def create_call_request():
    """Create a call request notification for a doctor"""
    data = request.get_json()
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    doctor_id = data.get('doctor_id')
    call_type = data.get('call_type')  # 'video', 'audio', 'text'
    message = data.get('message', '')

    if not doctor_id or not call_type:
        return jsonify({"error": "Doctor ID and call type are required"}), 400

    # Find the doctor by Doctor.id (not User.id)
    from models import Doctor
    doctor_profile = Doctor.query.filter_by(id=doctor_id).first()
    if not doctor_profile:
        return jsonify({"error": "Doctor not found"}), 404

    # Get the doctor's user account
    doctor_user = User.query.filter_by(id=doctor_profile.user_id).first()
    if not doctor_user:
        return jsonify({"error": "Doctor user account not found"}), 404

    # Create notification for the doctor
    title = f"New {call_type} call request"
    notification_message = f"Patient {current_user.username} has requested a {call_type} call."
    if message:
        notification_message += f" Message: {message}"

    notification = create_notification(
        user_id=doctor_user.id,
        title=title,
        message=notification_message,
        notification_type="call_request",
        related_id=current_user.id  # Store patient ID as related_id
    )

    return jsonify({
        "message": "Call request sent successfully",
        "notification_id": notification.id
    })

@notification_bp.route("/call-requests", methods=["GET"])
@jwt_required()
def get_call_requests():
    """Get call request notifications for current doctor"""
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if current_user.role != 'doctor':
        return jsonify({"error": "Only doctors can access call requests"}), 403

    notifications = Notification.query.filter_by(
        user_id=current_user.id,
        notification_type="call_request",
        is_read=False
    ).order_by(Notification.created_at.desc()).all()

    result = []
    for notification in notifications:
        patient = User.query.get(notification.related_id)
        result.append({
            "id": notification.id,
            "patient_name": patient.username if patient else "Unknown",
            "title": notification.title,
            "message": notification.message,
            "created_at": notification.created_at.isoformat(),
            "patient_id": notification.related_id
        })

    return jsonify({"call_requests": result})

@notification_bp.route("/call-request/<int:notification_id>/respond", methods=["POST"])
@jwt_required()
def respond_to_call_request(notification_id):
    """Respond to a call request (accept/reject)"""
    from models import Doctor, Patient, Consultation, VideoSession
    import uuid

    data = request.get_json()
    current_user = User.query.filter_by(username=get_jwt_identity()).first()

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    response_type = data.get('response')  # 'accepted' or 'rejected'

    if not response_type or response_type not in ['accepted', 'rejected']:
        return jsonify({"error": "Invalid response type"}), 400

    # Find the notification
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=current_user.id,
        notification_type="call_request"
    ).first()

    if not notification:
        return jsonify({"error": "Call request not found"}), 404

    # Mark as read
    notification.is_read = True

    if response_type == 'accepted':
        # Get doctor and patient profiles
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 404

        patient = Patient.query.filter_by(user_id=notification.related_id).first()
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 404

        # Extract call type from notification message
        call_type = 'video'  # default
        if 'audio' in notification.message.lower():
            call_type = 'audio'
        elif 'text' in notification.message.lower():
            call_type = 'text'

        # Check if an appointment exists between doctor and patient
        from models import Appointment
        appointment = Appointment.query.filter_by(doctor_id=doctor.id, patient_id=patient.id).first()
        if not appointment:
            appointment = Appointment(
                doctor_id=doctor.id,
                patient_id=patient.id,
                appointment_date=datetime.utcnow(),
                status="scheduled",
                reason=f"Auto-created for {call_type} call request",
                notes="Created via call request acceptance"
            )
            db.session.add(appointment)
            db.session.commit()

        # Create consultation
        consultation = Consultation(
            doctor_id=doctor.id,
            patient_id=patient.id,
            appointment_id=appointment.id,
            consultation_type=call_type,
            status='active',
            start_time=datetime.utcnow()
        )
        db.session.add(consultation)
        db.session.commit()

        # Start video session if it's video or audio call
        session_data = None
        if call_type in ['video', 'audio']:
            session_token = str(uuid.uuid4())
            video_session = VideoSession(
                consultation_id=consultation.id,
                session_token=session_token,
                status="active",
                start_time=datetime.utcnow(),
                participants=f"[{current_user.id}]"
            )
            db.session.add(video_session)
            db.session.commit()

            session_data = {
                "session_token": session_token,
                "session_id": video_session.id
            }

        db.session.commit()

        # Notify patient of doctor's response
        from models import User
        patient_user = User.query.filter_by(id=patient.user_id).first()
        response_title = f"Your {call_type} call request was {response_type}"
        response_message = f"Dr. {doctor.name} has {response_type} your {call_type} call request."
        create_notification(
            user_id=patient_user.id,
            title=response_title,
            message=response_message,
            notification_type="call_response",
            related_id=doctor.user_id
        )

        return jsonify({
            "message": f"Call request {response_type}",
            "notification_id": notification_id,
            "consultation_id": consultation.id,
            "call_type": call_type,
            "session": session_data
        })
    else:
        # Notify patient of doctor's response
        from models import User
        patient = Patient.query.filter_by(user_id=notification.related_id).first()
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if patient and doctor:
            patient_user = User.query.filter_by(id=patient.user_id).first()
            call_type = 'video'
            if 'audio' in notification.message.lower():
                call_type = 'audio'
            elif 'text' in notification.message.lower():
                call_type = 'text'
            response_title = f"Your {call_type} call request was {response_type}"
            response_message = f"Dr. {doctor.name} has {response_type} your {call_type} call request."
            create_notification(
                user_id=patient_user.id,
                title=response_title,
                message=response_message,
                notification_type="call_response",
                related_id=doctor.user_id
            )
        db.session.commit()
        return jsonify({
            "message": f"Call request {response_type}",
            "notification_id": notification_id
        })

# Helper function to send email notifications
def send_email_notification(user_email, subject, body):
    """Send email notification"""
    try:
        msg = Message(subject, recipients=[user_email])
        msg.body = body
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
