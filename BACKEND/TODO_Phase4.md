# Phase 4: Add Advanced Features - Detailed Steps

## 1. Implement AI-powered Diagnosis
- [x] Add Diagnosis model to models.py (for storing AI diagnoses)
- [x] Create ai_routes.py with /diagnose endpoint (placeholder for AI integration)
- [x] Update patient_routes.py to include diagnosis request
- [ ] Add AI service integration (e.g., OpenAI or custom model)

## 2. Add File Upload for Medical Images
- [x] Add MedicalImage model to models.py
- [x] Create upload_routes.py for file upload handling
- [x] Install and configure Flask-Uploads or similar
- [x] Add image storage directory and validation
- [ ] Integrate with AI diagnosis for image analysis

## 3. Add Video Call Session Management
- [x] Add VideoSession model to models.py
- [x] Create video_routes.py for session management
- [x] Add start/join/end video call endpoints
- [ ] Integrate with WebRTC or third-party service (e.g., Agora, Twilio)
- [x] Update consultation model to link video sessions

## 4. Enhance Chat/Message System
- [ ] Add real-time messaging (WebSockets with Flask-SocketIO)
- [ ] Add message read status and typing indicators
- [ ] Enhance message types (add image/file attachments)
- [ ] Add message search and filtering

## 5. Add Notification System
- [x] Add Notification model to models.py
- [x] Create notification_routes.py
- [ ] Add email notifications (Flask-Mail)
- [x] Add in-app notifications
- [ ] Integrate notifications with appointments, consultations, etc.

## General Updates
- [x] Update requirements.txt with new dependencies
- [x] Update app.py to register new blueprints
- [x] Add configuration for new features in config.py
- [x] Update README.md with new features documentation
