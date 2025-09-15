from models import db, User, Doctor

def create_missing_doctor_profiles():
    doctor_users = User.query.filter_by(role="doctor").all()
    created_profiles = []
    for user in doctor_users:
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            new_doctor = Doctor(
                user_id=user.id,
                name=user.username,
                specialization="General Medicine",
                license_number=f"LIC-{user.id:04d}",
                is_available=True
            )
            db.session.add(new_doctor)
            created_profiles.append(user.username)
    db.session.commit()
    print(f"Created doctor profiles for users: {created_profiles}")

if __name__ == "__main__":
    create_missing_doctor_profiles()
