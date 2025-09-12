# PAWMANITY Backend

## 🚀 Setup Instructions

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # (Linux/Mac)
   venv\Scripts\activate      # (Windows)

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```bash
   python app.py
   ```

4. Run tests:
   ```bash
   python -m pytest tests/ -v
   ```

5. Testing Video Call and Other Backend Features:
   - Use a REST client (Postman, curl) to test video call endpoints:
     - POST /video/session/start with JSON body { "consultation_id": <id> }
     - POST /video/session/join/<session_token>
     - POST /video/session/end/<session_id>
     - GET /video/sessions
   - Include JWT token in Authorization header.
   - Similarly test AI diagnosis (/ai/diagnose) and image upload (/upload/image) endpoints.
   - Refer to test files in tests/ for example requests and expected responses.
