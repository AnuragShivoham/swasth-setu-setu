import pytest
import os
from app import app, db
from models import User, Patient, MedicalImage
import json
from werkzeug.datastructures import FileStorage
from io import BytesIO
from werkzeug.security import generate_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_upload.db'
    app.config['UPLOAD_FOLDER'] = 'test_uploads'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            # Create test user and patient
            test_user = User(username='testpatient_upload', password=generate_password_hash('password'), email='test_upload@example.com', role='patient')
            db.session.add(test_user)
            db.session.commit()
            test_patient = Patient(user_id=test_user.id, name='Test Patient')
            db.session.add(test_patient)
            db.session.commit()
        yield client
        # Cleanup
        if os.path.exists(app.config['UPLOAD_FOLDER']):
            for file in os.listdir(app.config['UPLOAD_FOLDER']):
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], file))
            os.rmdir(app.config['UPLOAD_FOLDER'])
        if os.path.exists('test_upload.db'):
            os.remove('test_upload.db')

def get_jwt_token(client):
    # Login to get JWT token
    response = client.post('/auth/login', json={'username': 'testpatient_upload', 'password': 'password'})
    return json.loads(response.data)['token']

def test_upload_image_requires_auth(client):
    data = {'file': (BytesIO(b'fake image data'), 'test.jpg')}
    response = client.post('/upload/image', data=data, content_type='multipart/form-data')
    assert response.status_code == 401

def test_upload_image_success(client):
    token = get_jwt_token(client)
    headers = {'Authorization': f'Bearer {token}'}
    data = {'file': (BytesIO(b'fake image data'), 'test.jpg')}
    response = client.post('/upload/image', data=data, headers=headers, content_type='multipart/form-data')
    assert response.status_code == 201
    data_resp = json.loads(response.data)
    assert 'image_id' in data_resp
    assert 'filename' in data_resp

def test_get_images(client):
    token = get_jwt_token(client)
    headers = {'Authorization': f'Bearer {token}'}
    # First upload an image
    data = {'file': (BytesIO(b'fake image data'), 'test.jpg')}
    client.post('/upload/image', data=data, headers=headers, content_type='multipart/form-data')
    # Then get images
    response = client.get('/upload/images', headers=headers)
    assert response.status_code == 200
    data_resp = json.loads(response.data)
    assert isinstance(data_resp, list)
    assert len(data_resp) > 0
