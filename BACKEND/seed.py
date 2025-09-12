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
            if existing_user:
                print(f"User {username} already exists, skipping...")
                continue

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

            # Create profile based on role
            if user_data['role'] == 'doctor':
                new_doctor = Doctor(
                    user_id=new_user.id,
                    name=username,  # Use username as name for now
                    specialization="General Medicine",  # Default
                    license_number=f"LIC-{new_user.id:04d}",  # Generate license
                    is_available=True
                )
                db.session.add(new_doctor)
                print(f"Created doctor profile for {username}")
            elif user_data['role'] == 'patient':
                new_patient = Patient(
                    user_id=new_user.id,
                    name=username,  # Use username as name
                    symptoms="",  # Empty for now
                )
                db.session.add(new_patient)
                print(f"Created patient profile for {username}")

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
