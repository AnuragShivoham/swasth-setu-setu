import pytest
from app import app, db
from models import User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

def test_register_success(client):
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass',
        'email': 'test@example.com',
        'role': 'patient'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'User registered successfully'

    # Check user was created
    user = User.query.filter_by(username='testuser').first()
    assert user is not None
    assert user.email == 'test@example.com'
    assert user.role == 'patient'

def test_register_duplicate_username(client):
    # First registration
    client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass',
        'email': 'test@example.com',
        'role': 'patient'
    })

    # Second registration with same username
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass2',
        'email': 'test2@example.com',
        'role': 'patient'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'Username already exists' in data['error']

def test_register_duplicate_email(client):
    # First registration
    client.post('/auth/register', json={
        'username': 'testuser1',
        'password': 'testpass',
        'email': 'test@example.com',
        'role': 'patient'
    })

    # Second registration with same email
    response = client.post('/auth/register', json={
        'username': 'testuser2',
        'password': 'testpass',
        'email': 'test@example.com',
        'role': 'patient'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'Email already exists' in data['error']

def test_register_missing_fields(client):
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass'
        # missing email and role
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'Missing required fields' in data['error']

def test_login_success(client):
    # Register first
    client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass',
        'email': 'test@example.com',
        'role': 'patient'
    })

    # Login
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data

def test_login_invalid_credentials(client):
    response = client.post('/auth/login', json={
        'username': 'nonexistent',
        'password': 'wrongpass'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'Invalid credentials' in data['error']
