#!/usr/bin/env python3

from app import app
from models import db, Doctor, Patient, Consultation, VideoSession, User, Notification
from datetime import datetime
import uuid

def test_call_acceptance():
    with app.app_context():
        print("Testing call request acceptance process...")

        try:
            # Get a doctor and patient for testing
            doctor = Doctor.query.first()
            patient = Patient.query.first()

            if not doctor:
                print("No doctor found in database")
                return

            if not patient:
                print("No patient found in database")
                return

            print(f"Using Doctor: {doctor.name} (ID: {doctor.id})")
            print(f"Using Patient: {patient.name} (ID: {patient.id})")

            # Test creating a consultation
            print("\n1. Testing consultation creation...")
            consultation = Consultation(
                doctor_id=doctor.id,
                patient_id=patient.id,
                consultation_type='video',
                status='active',
                start_time=datetime.utcnow()
            )
            db.session.add(consultation)
            db.session.commit()
            print(f"✓ Consultation created with ID: {consultation.id}")

            # Test creating a video session
            print("\n2. Testing video session creation...")
            session_token = str(uuid.uuid4())
            video_session = VideoSession(
                consultation_id=consultation.id,
                session_token=session_token,
                status="active",
                start_time=datetime.utcnow(),
                participants=f"[{doctor.user_id}]"
            )
            db.session.add(video_session)
            db.session.commit()
            print(f"✓ Video session created with ID: {video_session.id}, Token: {session_token}")

            # Test the complete flow
            print("\n3. Testing complete call acceptance flow...")

            # Simulate notification creation
            notification = Notification(
                user_id=doctor.user_id,
                title="Test Video Call Request",
                message="Patient has requested a video call.",
                notification_type="call_request",
                related_id=patient.user_id
            )
            db.session.add(notification)
            db.session.commit()
            print(f"✓ Notification created with ID: {notification.id}")

            # Simulate acceptance
            notification.is_read = True

            # Create consultation for acceptance
            consultation2 = Consultation(
                doctor_id=doctor.id,
                patient_id=patient.id,
                consultation_type='video',
                status='active',
                start_time=datetime.utcnow()
            )
            db.session.add(consultation2)
            db.session.commit()

            # Create video session for acceptance
            session_token2 = str(uuid.uuid4())
            video_session2 = VideoSession(
                consultation_id=consultation2.id,
                session_token=session_token2,
                status="active",
                start_time=datetime.utcnow(),
                participants=f"[{doctor.user_id}]"
            )
            db.session.add(video_session2)
            db.session.commit()

            print(f"✓ Call acceptance simulation successful!")
            print(f"  - Consultation ID: {consultation2.id}")
            print(f"  - Session ID: {video_session2.id}")
            print(f"  - Session Token: {session_token2}")

            db.session.commit()

        except Exception as e:
            print(f"❌ Error during testing: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()

if __name__ == "__main__":
    test_call_acceptance()
