import pytest
from app import app, db
from models import User, Patient, Doctor, Consultation, VideoSession
import json
from werkzeug.security import generate_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_video.db'
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            # Create test users
            patient_user = User(username='testpatient_video', password=generate_password_hash('password'), email='patient_video@example.com', role='patient')
            doctor_user = User(username='testdoctor_video', password=generate_password_hash('password'), email='doctor_video@example.com', role='doctor')
            db.session.add(patient_user)
            db.session.add(doctor_user)
            db.session.commit()
            test_patient = Patient(user_id=patient_user.id, name='Test Patient')
            test_doctor = Doctor(user_id=doctor_user.id, name='Test Doctor', specialization='General', license_number='12345')
            db.session.add(test_patient)
            db.session.add(test_doctor)
            db.session.commit()
            # Create a consultation
            consultation = Consultation(patient_id=test_patient.id, doctor_id=test_doctor.id, consultation_type='video')
            db.session.add(consultation)
            db.session.commit()
        yield client
        # Cleanup
        import os
        if os.path.exists('test_video.db'):
            os.remove('test_video.db')

def get_jwt_token(client, username):
    if username == 'testdoctor':
        username = 'testdoctor_video'
    elif username == 'testpatient':
        username = 'testpatient_video'
    response = client.post('/auth/login', json={'username': username, 'password': 'password'})
    return json.loads(response.data)['token']

def test_start_video_session_requires_auth(client):
    response = client.post('/video/session/start', json={'consultation_id': 1})
    assert response.status_code == 401

def test_start_video_session_success(client):
    token = get_jwt_token(client, 'testdoctor')
    headers = {'Authorization': f'Bearer {token}'}
    response = client.post('/video/session/start', json={'consultation_id': 1}, headers=headers)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'session_id' in data
    assert 'session_token' in data

def test_join_video_session(client):
    # First start a session
    token = get_jwt_token(client, 'testdoctor')
    headers = {'Authorization': f'Bearer {token}'}
    start_response = client.post('/video/session/start', json={'consultation_id': 1}, headers=headers)
    session_token = json.loads(start_response.data)['session_token']
    # Then join as patient
    patient_token = get_jwt_token(client, 'testpatient')
    patient_headers = {'Authorization': f'Bearer {patient_token}'}
    response = client.post(f'/video/session/join/{session_token}', headers=patient_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data

def test_get_video_sessions(client):
    token = get_jwt_token(client, 'testpatient')
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/video/sessions', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
