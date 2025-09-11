import pytest
from app import app, db
from models import User, Patient, Diagnosis
import json
from werkzeug.security import generate_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            # Create test user and patient
            test_user = User(username='testpatient_ai', password=generate_password_hash('password'), email='test_ai@example.com', role='patient')
            db.session.add(test_user)
            db.session.commit()
            test_patient = Patient(user_id=test_user.id, name='Test Patient')
            db.session.add(test_patient)
            db.session.commit()
        yield client

def get_jwt_token(client):
    # Login to get JWT token
    response = client.post('/auth/login', json={'username': 'testpatient_ai', 'password': 'password'})
    return json.loads(response.data)['token']

def test_diagnose_requires_auth(client):
    response = client.post('/ai/diagnose', json={'symptoms': 'cough'})
    assert response.status_code == 401

def test_diagnose_success(client):
    token = get_jwt_token(client)
    headers = {'Authorization': f'Bearer {token}'}
    response = client.post('/ai/diagnose', json={'symptoms': 'cough'}, headers=headers)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'diagnosis_id' in data
    assert 'ai_diagnosis' in data
    assert 'confidence_score' in data

def test_get_diagnoses(client):
    token = get_jwt_token(client)
    headers = {'Authorization': f'Bearer {token}'}
    # First create a diagnosis
    client.post('/ai/diagnose', json={'symptoms': 'headache'}, headers=headers)
    # Then get diagnoses
    response = client.get('/ai/diagnoses', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0
