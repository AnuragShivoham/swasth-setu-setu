import sys
sys.path.append('.')
from app import app, db
from models import User, Doctor
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Check if testdoctor exists
    existing_user = User.query.filter_by(username='testdoctor').first()
    if existing_user:
        print('Test doctor user already exists')
    else:
        # Create user
        hashed_pw = generate_password_hash('testpassword')
        new_user = User(
            username='testdoctor',
            password=hashed_pw,
            email='testdoctor@example.com',
            role='doctor'
        )
        db.session.add(new_user)
        db.session.flush()

        # Create doctor profile
        new_doctor = Doctor(
            user_id=new_user.id,
            name='Test Doctor',
            specialization='General Medicine',
            license_number='LIC-TEST001',
            is_available=True
        )
        db.session.add(new_doctor)
        db.session.commit()
        print('Test doctor user created successfully')
