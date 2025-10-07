import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

def load_users():
    """Load users from JSON file"""
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def register_user(username, password, email, role):
    """Register a new user"""
    users = load_users()

    if username in users:
        return False, "Username already exists"

    if any(user['email'] == email for user in users.values()):
        return False, "Email already exists"

    hashed_password = generate_password_hash(password)
    user_id = str(len(users) + 1)

    user = {
        'id': user_id,
        'username': username,
        'password': hashed_password,
        'email': email,
        'role': role,
        'created_at': datetime.utcnow().isoformat(),
        'profile': {}  # For doctor/patient specific data
    }

    users[username] = user
    save_users(users)
    return True, user_id

def authenticate_user(username, password):
    """Authenticate user"""
    users = load_users()
    user = users.get(username)
    if not user:
        return False, None

    if check_password_hash(user['password'], password):
        return True, user
    return False, None

def get_user_by_username(username):
    """Get user by username"""
    users = load_users()
    return users.get(username)

def update_user_profile(username, profile_data):
    """Update user profile data"""
    users = load_users()
    if username in users:
        users[username]['profile'].update(profile_data)
        save_users(users)
        return True
    return False

def get_all_users():
    """Get all users"""
    return load_users()
