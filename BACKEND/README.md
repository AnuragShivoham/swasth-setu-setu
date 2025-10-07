# PAWMANITY Backend

A comprehensive telemedicine backend API built with Flask, providing features for patient-doctor consultations, AI-powered diagnosis, medical image uploads, video calls, and notifications.

## 🗄️ Database Architecture

This application uses a **hybrid database approach** for optimal performance:

### SQLAlchemy (PostgreSQL/MySQL/SQLite)
- **Core structured data**: Users, Patients, Doctors, Appointments, Consultations, Messages
- **Transactional data**: Requires ACID compliance and complex relationships
- **Relational queries**: Efficient for joins and structured reporting

### MongoDB
- **Unstructured/AI data**: AI diagnosis logs, raw AI responses, processing metadata
- **Flexible schemas**: Store varying AI model outputs and diagnostic data
- **High-volume logs**: Efficient for time-series data and analytics

### Configuration
Set environment variables in `.env` file:
```bash
DATABASE_URI=postgresql://user:pass@localhost/pawmanity  # SQLAlchemy
MONGO_URI=mongodb://localhost:27017/pawmanity           # MongoDB
```

## 🚀 Setup Instructions

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # (Linux/Mac)
   venv\Scripts\activate      # (Windows)
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (optional, see config.py for defaults):
   ```bash
   export FLASK_ENV=development
   export SECRET_KEY=your-secret-key
   export JWT_SECRET_KEY=your-jwt-secret
   ```

4. Run the backend server:
   ```bash
   python app.py
   ```

5. Run tests:
   ```bash
   python -m pytest tests/ -v
   ```

## 📋 Features

### Core Features
- **User Authentication**: JWT-based authentication for patients, doctors, and admins
- **Patient Management**: Profile creation, medical history tracking
- **Doctor Management**: Doctor profiles, availability, specializations
- **Appointment Booking**: Schedule appointments with doctors
- **Consultation Management**: Start, manage, and end consultations

### Advanced Features (Phase 4)
- **AI-Powered Diagnosis**: Placeholder AI diagnosis based on symptoms
- **Medical Image Upload**: Secure file upload for medical images with validation
- **Video Call Sessions**: Manage video call sessions linked to consultations
- **Enhanced Messaging**: Real-time messaging with WebSocket support (planned)
- **Notification System**: Email and in-app notifications for appointments and consultations

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

### Patient
- `GET /patient/profile` - Get patient profile
- `PUT /patient/profile` - Update patient profile
- `POST /patient/diagnose` - Request AI diagnosis
- `GET /patient/medical-history` - Get medical history

### Doctor
- `GET /doctor/profile` - Get doctor profile
- `PUT /doctor/profile` - Update doctor profile
- `GET /doctor/appointments` - Get doctor appointments
- `GET /doctor/patients` - Get doctor's patients

### Appointments
- `GET /appointment/list` - List appointments
- `POST /appointment/book` - Book new appointment
- `PUT /appointment/<id>/status` - Update appointment status

### Consultations
- `POST /consultation/start` - Start consultation
- `GET /consultation/<id>/messages` - Get consultation messages
- `POST /consultation/<id>/message` - Send message
- `PUT /consultation/<id>/end` - End consultation
- `GET /consultation/active` - Get active consultations

### AI Diagnosis
- `POST /ai/diagnose` - Get AI diagnosis
- `GET /ai/diagnoses` - Get user's AI diagnoses

### File Upload
- `POST /upload/image` - Upload medical image
- `GET /upload/images` - Get user's uploaded images

### Video Calls
- `POST /video/session/start` - Start video session
- `POST /video/session/join/<token>` - Join video session
- `POST /video/session/end/<id>` - End video session
- `GET /video/sessions` - Get video sessions

### Notifications (Planned)
- `GET /notification/list` - Get user notifications
- `PUT /notification/<id>/read` - Mark notification as read

## 🧪 Testing

Use a REST client (Postman, curl) to test endpoints. Include JWT token in Authorization header for protected routes.

Example test commands:
```bash
# Register a user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","email":"test@example.com","role":"patient"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Test AI diagnosis (include token from login)
curl -X POST http://localhost:5000/ai/diagnose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"symptoms":"fever and cough"}'
```

Refer to test files in `tests/` for comprehensive examples.
