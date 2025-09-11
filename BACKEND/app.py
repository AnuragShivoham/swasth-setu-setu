from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

app = Flask(__name__)

# Load config
app.config.from_object("config.Config")

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

@app.route("/")
def home():
    return {"message": "Telemedicine AI Backend running!"}

if __name__ == "__main__":
    app.run(debug=True)
