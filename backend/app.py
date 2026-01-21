from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

MODEL_PATH = "model.pkl"
model = None

# Load model safely
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
else:
    print("CRITICAL ERROR: model.pkl not found!")

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        # Ensure request is JSON
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()

        # Validate 'features' key exists
        if "features" not in data:
            return jsonify({"error": "'features' key missing in request"}), 400

        features = np.array(data["features"])

        # Check if features have correct shape for the model
        if features.ndim == 1:
            features = features.reshape(1, -1)
        elif features.ndim != 2:
            return jsonify({"error": "Features must be a 1D or 2D array"}), 400

        # Prediction
        prediction = model.predict(features)[0]

        # Confidence
        probabilities = model.predict_proba(features)[0]
        confidence = round(float(np.max(probabilities)) * 100, 2)

        # Map prediction to human-readable label
        result = "Malignant" if prediction == 0 else "Benign"

        return jsonify({
            "prediction": result,
            "confidence": f"{confidence}%"
        })

    except Exception as e:
        print("Error in /predict:")
        traceback.print_exc()  # Full error printed to console
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "Breast Cancer Prediction API is running"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
