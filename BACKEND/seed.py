import json
from app import app, db
from models import User, Doctor, Patient
from werkzeug.security import generate_password_hash
from datetime import datetime

def seed_database():
    with app.app_context():
        # Load users from JSON
        with open('users.json', 'r') as f:
            users_data = json.load(f)

        for username, user_data in users_data.items():
            # Check if user already exists in database
            existing_user = User.query.filter_by(username=username).first()
            if not existing_user:
                # Create User
                new_user = User(
                    username=username,
                    password=user_data['password'],  # Already hashed
                    email=user_data['email'],
                    role=user_data['role'],
                    created_at=datetime.fromisoformat(user_data['created_at'])
                )
                db.session.add(new_user)
                db.session.flush()  # Get user ID
                user_id = new_user.id
                print(f"Created user {username}")
            else:
                user_id = existing_user.id
                print(f"User {username} already exists")

            # Check if profile exists
            if user_data['role'] == 'doctor':
                existing_doctor = Doctor.query.filter_by(user_id=user_id).first()
                if not existing_doctor:
                    new_doctor = Doctor(
                        user_id=user_id,
                        name=username,  # Use username as name for now
                        specialization="General Medicine",  # Default
                        license_number=f"LIC-{user_id:04d}",  # Generate license
                        is_available=True
                    )
                    db.session.add(new_doctor)
                    print(f"Created doctor profile for {username}")
                else:
                    print(f"Doctor profile for {username} already exists")
            elif user_data['role'] == 'patient':
                existing_patient = Patient.query.filter_by(user_id=user_id).first()
                if not existing_patient:
                    new_patient = Patient(
                        user_id=user_id,
                        name=username,  # Use username as name
                        symptoms="",  # Empty for now
                    )
                    db.session.add(new_patient)
                    print(f"Created patient profile for {username}")
                else:
                    print(f"Patient profile for {username} already exists")

        db.session.commit()

        # Print counts
        user_count = User.query.count()
        doctor_count = Doctor.query.count()
        patient_count = Patient.query.count()
        print(f"Database seeded successfully! Users: {user_count}, Doctors: {doctor_count}, Patients: {patient_count}")

if __name__ == '__main__':
    seed_database()
