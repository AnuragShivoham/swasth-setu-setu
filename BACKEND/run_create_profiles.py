from app import app
from scripts.create_missing_doctor_profiles import create_missing_doctor_profiles

with app.app_context():
    create_missing_doctor_profiles()
