#!/usr/bin/env python3

from app import app
from models import db, Doctor, Patient, Consultation, VideoSession, User, Notification

def test_models():
    with app.app_context():
        print("Testing model imports and database connection...")

        try:
            # Test basic model attributes
            print(f"Doctor table: {Doctor.__tablename__}")
            print(f"Patient table: {Patient.__tablename__}")
            print(f"Consultation table: {Consultation.__tablename__}")
            print(f"VideoSession table: {VideoSession.__tablename__}")
            print(f"User table: {User.__tablename__}")
            print(f"Notification table: {Notification.__tablename__}")

            # Test database connection
            db.engine.execute("SELECT 1")
            print("Database connection successful")

            # Check if tables exist
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Available tables: {tables}")

            print("All models imported successfully!")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_models()
