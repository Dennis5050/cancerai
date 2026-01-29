import { useState, useEffect, useRef } from "react";
import { Activity, Beaker, ClipboardList, User, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Diagnosis() {
  const navigate = useNavigate();
  const [features, setFeatures] = useState(Array(30).fill(""));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedSample, setSelectedSample] = useState("");
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const labels = [
    "Mean Radius","Mean Texture","Mean Perimeter","Mean Area","Mean Smoothness",
    "Mean Compactness","Mean Concavity","Mean Concave Points","Mean Symmetry","Mean Fractal Dimension",
    "SE Radius","SE Texture","SE Perimeter","SE Area","SE Smoothness",
    "SE Compactness","SE Concavity","SE Concave Points","SE Symmetry","SE Fractal Dimension",
    "Worst Radius","Worst Texture","Worst Perimeter","Worst Area","Worst Smoothness",
    "Worst Compactness","Worst Concavity","Worst Concave Points","Worst Symmetry","Worst Fractal Dimension"
  ];

  const samplePatients = {
    "Benign Sample": [
      12.48,15.71,82.57,477.1,0.09856,0.07708,0.0296,0.02816,0.1565,0.05884,
      0.5781,1.542,4.529,35.68,0.005895,0.01785,0.01127,0.005678,0.02261,0.003863,
      15.12,20.45,98.87,654.1,0.1283,0.1819,0.09676,0.06496,0.2416,0.07386
    ],
    "Malignant Sample": [
      17.99,10.38,122.8,1001,0.1184,0.2776,0.3001,0.1471,0.2419,0.07871,
      1.095,0.9053,8.589,153.4,0.006399,0.04904,0.05373,0.01587,0.03003,0.006193,
      25.38,17.33,184.6,2019,0.1622,0.6656,0.7119,0.2654,0.4601,0.1189
    ]
  };

  const handleSampleSelect = (e) => {
    const key = e.target.value;
    setSelectedSample(key);
    if (samplePatients[key]) {
      setFeatures(samplePatients[key]);
      setError("");
    }
  };

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const runPrediction = async () => {
    setError("");
    setResult(null);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const numericFeatures = features.map(Number);
    const invalidIndexes = numericFeatures
      .map((f, i) => (isNaN(f) ? i : null))
      .filter((i) => i !== null);

    if (invalidIndexes.length > 0) {
      setError("⚠️ All diagnostic fields must contain valid numeric values.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/predict", { features: numericFeatures });

      setResult({
        prediction: data.prediction,
        confidence: Math.round(data.confidence * 100),
        riskLevel: data.risk_level,
        explanation: data.clinical_explanation,
        message: data.message,
      });

    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else {
        setResult({
          prediction: "Error",
          confidence: "--",
          riskLevel: "Unknown",
          explanation: "Unable to reach AI service.",
          message: "System error occurred."
        });
      }
    }
    setLoading(false);
  };

  const allFieldsFilled = features.every(f => f !== "" && !isNaN(f));

  // ---------------- Fetch doctor info ----------------
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get("/doctor/me");
        setDoctor(data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchDoctor();
  }, [navigate]);

  // ---------------- Close dropdown ----------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" />
            <h1 className="text-xl font-bold">CancerAI — Clinical Decision Support</h1>
          </div>

          {doctor && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-gray-200 p-2 rounded-full">
                <User />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow p-4 w-64">
                  <p className="font-semibold">{doctor.full_name}</p>
                  <p className="text-sm">{doctor.email}</p>
                  <p className="text-sm">License: {doctor.license_number}</p>
                  <button onClick={handleLogout}
                    className="mt-3 w-full bg-red-600 text-white py-1 rounded">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* FORM */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6 flex gap-2">
          <ClipboardList /> Diagnostic Input
        </h3>

        <select value={selectedSample} onChange={handleSampleSelect}
          className="mb-6 w-full md:w-96 p-2 border rounded">
          <option value="">-- Load Sample Patient --</option>
          {Object.keys(samplePatients).map(k => (
            <option key={k}>{k}</option>
          ))}
        </select>

        <div className="grid md:grid-cols-2 gap-4">
          {labels.map((label, i) => (
            <div key={i}>
              <label className="text-xs font-semibold">{label}</label>
              <input
                type="number"
                value={features[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border p-4 rounded">{error}</div>
        )}

        <button
          onClick={runPrediction}
          disabled={loading || !allFieldsFilled}
          className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-lg flex gap-2"
        >
          <Beaker />
          {loading ? "Analyzing..." : "Run Diagnosis"}
        </button>

        {/* RESULTS + EXPLAINABILITY */}
        {result && (
          <div className="mt-10 bg-white border rounded-xl p-6">
            <h4 className={`text-3xl font-black ${
              result.prediction === "Malignant" ? "text-red-600" : "text-green-600"
            }`}>
              {result.prediction}
            </h4>

            <p className="mt-2">Confidence: <strong>{result.confidence}%</strong></p>
            <p className="mt-2">Risk Level: <strong>{result.riskLevel}</strong></p>

            <div className="mt-4 bg-blue-50 border p-4 rounded flex gap-2">
              <Info className="text-blue-600" />
              <p className="text-sm">{result.explanation}</p>
            </div>

            <p className="mt-4 font-semibold">{result.message}</p>
          </div>
        )}
      </section>

      <footer className="bg-slate-900 text-slate-300 text-center py-6">
        © {new Date().getFullYear()} CancerAI — Final Year Project
      </footer>
    </div>
  );
}
