import openai
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os

patient_bp = Blueprint("patient", __name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@patient_bp.route("/diagnose", methods=["POST"])
@jwt_required()
def diagnose():
    data = request.get_json()
    symptoms = data.get("symptoms")

    # Simple GPT-based diagnosis
    response = openai.Completion.create(
        model="gpt-3.5-turbo",
        prompt=f"Patient symptoms: {symptoms}. Suggest possible diagnosis.",
        max_tokens=150
    )
    return jsonify({"diagnosis": response.choices[0].text.strip()})
