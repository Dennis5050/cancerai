# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import pickle
import numpy as np
from dotenv import load_dotenv

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey12345")
JWT_EXP_DELTA_SECONDS = int(os.getenv("JWT_EXP_DELTA_SECONDS", 3600))

# -------------------------
# Flask app
# -------------------------
app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",       # Vite dev server
        "https://cancerai.vercel.app" # Production frontend
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"]
)

app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///doctors.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -------------------------
# Doctor model
# -------------------------
class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    license_number = db.Column(db.String(50))
    password = db.Column(db.String(200), nullable=False)

# -------------------------
# Load ML model
# -------------------------
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Failed to load model:", e)
    model = None

# -------------------------
# JWT token decorator
# -------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            bearer = request.headers["Authorization"]
            if bearer.startswith("Bearer "):
                token = bearer[7:]

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = Doctor.query.filter_by(email=payload["email"]).first()
            if not current_user:
                raise Exception("User not found")
        except Exception:
            return jsonify({"message": "Token is invalid or expired"}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# -------------------------
# Auth routes
# -------------------------
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    license_number = data.get("license_number")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    if Doctor.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)
    new_doctor = Doctor(
        full_name=full_name,
        email=email,
        license_number=license_number,
        password=hashed_password,
    )
    db.session.add(new_doctor)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    doctor = Doctor.query.filter_by(email=email).first()
    if not doctor or not check_password_hash(doctor.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    payload = {
        "email": doctor.email,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS),
    }
    token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
    return jsonify({"access_token": token})


# -------------------------
# Get current doctor info
# -------------------------
@app.route("/doctor/me", methods=["GET"])
@token_required
def get_doctor(current_user):
    return jsonify(
        {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "license_number": current_user.license_number,
        }
    )


# -------------------------
# Prediction route (WITH EXPLAINABILITY)
# -------------------------
@app.route("/predict", methods=["POST"])
@token_required
def predict(current_user):
    if model is None:
        return (
            jsonify(
                {
                    "prediction": "Error",
                    "confidence": 0.0,
                    "message": "Model not loaded",
                }
            ),
            500,
        )

    data = request.json
    features = data.get("features")

    if not features or len(features) != 30:
        return jsonify({"message": "Exactly 30 features required"}), 400

    try:
        features = np.array(features, dtype=float).reshape(1, -1)
    except ValueError:
        return jsonify({"message": "All features must be numeric"}), 400

    try:
        pred_numeric = int(model.predict(features)[0])
        confidence = (
            float(np.max(model.predict_proba(features)))
            if hasattr(model, "predict_proba")
            else 0.9
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "prediction": "Error",
                    "confidence": 0.0,
                    "message": f"Prediction failed: {e}",
                }
            ),
            500,
        )

    # -------------------------
    # Explainability logic
    # -------------------------
    prediction = "Malignant" if pred_numeric == 0 else "Benign"

    if pred_numeric == 0:
        risk_level = "High risk"
        clinical_explanation = (
            "The model detected feature patterns commonly associated with malignant tumors, "
            "including irregular cell structure and abnormal texture measurements."
        )
        message = "Immediate oncologist consultation advised."

    elif pred_numeric == 1 and confidence < 0.7:
        risk_level = "Intermediate risk"
        clinical_explanation = (
            "The model predicts a benign outcome, but confidence is below the clinical safety threshold. "
            "Some feature values overlap with malignant patterns."
        )
        message = (
            "Low confidence benign result. Follow-up imaging or clinical review recommended."
        )

    else:
        risk_level = "Low risk"
        clinical_explanation = (
            "The input features closely match patterns seen in benign breast tissue, "
            "with smooth cell boundaries and consistent texture measurements."
        )
        message = "Low risk detected. Routine monitoring recommended."

    return jsonify(
        {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "risk_level": risk_level,
            "clinical_explanation": clinical_explanation,
            "message": message,
        }
    )


# -------------------------
# Initialize DB and run server
# -------------------------
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
