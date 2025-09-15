# PAWMANITY Backend Development TODO

## Phase 1: Fix and Complete Basic Setup
- [x] Fix requirements.txt: Remove flask-pymongo, add flask-sqlalchemy
- [x] Complete app.py: Register blueprints, add run block
- [ ] Update README.md with full setup instructions

## Phase 2: Enhance Database Models
- [x] Add Doctor model
- [x] Add Appointment model
- [x] Add Consultation model
- [x] Link Patient to User model
- [x] Add relationships and constraints

## Phase 3: Expand Routes and APIs
- [x] Add doctor_routes.py for doctor management
- [x] Add appointment_routes.py for booking
- [x] Add consultation_routes.py for sessions
- [x] Enhance patient_routes.py with real diagnosis logic
- [x] Add JWT protection to all protected routes

## Phase 4: Add Advanced Features
- [x] Implement AI-powered diagnosis (placeholder for now)
- [x] Add file upload for medical images
- [x] Add video call session management
- [x] Add basic chat/message system
- [x] Add notification system (in-app, email setup)

## Phase 5: Testing and Validation
- [ ] Update and expand test files
- [ ] Add input validation and error handling
- [ ] Add database migration setup
- [ ] Test all endpoints

## Phase 6: Integration and Deployment
- [ ] Ensure API compatibility with frontend
- [ ] Add CORS support
- [ ] Add environment configuration
- [ ] Prepare for deployment

## Phase 7: Documentation and Finalization
- [ ] Complete README with API documentation
- [ ] Add code comments and docstrings
- [ ] Final testing and bug fixes
