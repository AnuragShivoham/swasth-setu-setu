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
