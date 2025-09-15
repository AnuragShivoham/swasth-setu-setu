from flask import Flask
from flask_cors import CORS
from db import db, init_mongo
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.appointment_routes import appointment_bp
from routes.consultation_routes import consultation_bp
from routes.ai_routes import ai_bp
from routes.upload_routes import upload_bp
from routes.video_routes import video_bp
from routes.notification_routes import notification_bp

app = Flask(__name__)
app.config.from_object("config.Config")

# Enable CORS for frontend integration
CORS(app)

db.init_app(app)
jwt = JWTManager(app)

# Initialize Flask-Mail
mail = Mail(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(patient_bp, url_prefix='/patient')
app.register_blueprint(doctor_bp, url_prefix='/doctor')
app.register_blueprint(appointment_bp, url_prefix='/appointment')
app.register_blueprint(consultation_bp, url_prefix='/consultation')
app.register_blueprint(ai_bp, url_prefix='/ai')
app.register_blueprint(upload_bp, url_prefix='/upload')
app.register_blueprint(video_bp, url_prefix='/video')
app.register_blueprint(notification_bp, url_prefix='/notification')

# Create database tables and initialize MongoDB
with app.app_context():
    db.create_all()
    init_mongo()

if __name__ == '__main__':
    app.run(debug=True)
