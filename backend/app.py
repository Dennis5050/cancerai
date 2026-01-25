from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import logging

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # allow all origins for production

# ---------------- SUPPRESS LOGS ----------------
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)  # only show errors

# ---------------- LOAD AI MODEL ----------------
MODEL_PATH = "model.pkl"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("model.pkl not found. Please generate it first with train_model.py")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# ---------------- PREDICTION ENDPOINT ----------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    features = data.get("features")

    # Validate features
    if not features or not isinstance(features, list) or len(features) != 30:
        return jsonify({"error": "Exactly 30 numeric features are required"}), 422

    try:
        features_array = np.array([float(f) for f in features]).reshape(1, -1)
    except Exception as e:
        return jsonify({"error": "All features must be numeric"}), 422

    try:
        prediction = model.predict(features_array)[0]
        probabilities = model.predict_proba(features_array)[0]
        confidence = round(float(np.max(probabilities)) * 100, 2)
        result = "Benign" if prediction == 1 else "Malignant"

        return jsonify({
            "prediction": result,
            "confidence": f"{confidence}%"
        })

    except Exception as e:
        return jsonify({
            "prediction": "Error",
            "confidence": "0%",
            "error": f"Prediction failed: {str(e)}"
        }), 500

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Hospital AI System Running"

# ---------------- MAIN ----------------
if __name__ == "__main__":
    # Run quietly without debug logs
    app.run(host="0.0.0.0", port=5000)
