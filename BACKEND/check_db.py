from app import app, db
from models import Doctor

with app.app_context():
    doctors = Doctor.query.all()
    for doctor in doctors:
        print(f"ID: {doctor.id}, Name: {doctor.name}, Specialization: {doctor.specialization}, Phone: {doctor.phone}, Bio: {doctor.bio}")
