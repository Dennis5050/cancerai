import { useState } from "react";
import { Activity, Beaker, ClipboardList } from "lucide-react";

export default function App() {
  const [features, setFeatures] = useState(Array(30).fill(""));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedSample, setSelectedSample] = useState("");
  const [error, setError] = useState("");

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
    if (samplePatients[key]) setFeatures(samplePatients[key]);
    setError("");
    setResult(null);
  };

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const runPrediction = async () => {
    setError("");
    setResult(null);

    const numericFeatures = features.map(Number);
    const invalid = numericFeatures.some(f => isNaN(f));

    if (invalid || numericFeatures.length !== 30) {
      setError("⚠️ All 30 diagnostic features must be valid numbers.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://cancerai.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: numericFeatures })
      });

      const data = await response.json();

      setResult({
        status: data.prediction,
        confidence: data.confidence,
        recommendation:
          data.prediction === "Benign"
            ? "Routine follow-up recommended in 6 months."
            : "Immediate oncologist consultation advised."
      });
    } catch {
      setResult({
        status: "Error",
        confidence: "--",
        recommendation: "Unable to connect to AI server."
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">

      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Activity className="text-blue-600" />
          <h1 className="text-xl font-bold">CancerAI — Breast Cancer Prediction System</h1>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-blue-50 py-20 text-center">
        <h2 className="text-4xl font-black mb-4">AI-Powered Clinical Decision Support</h2>
        <p className="max-w-3xl mx-auto text-slate-600">
          Early breast cancer detection using machine learning on validated diagnostic datasets.
        </p>
      </section>

      {/* DIAGNOSIS FORM */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ClipboardList className="text-blue-600" />
          Diagnostic Input
        </h3>

        <select
          value={selectedSample}
          onChange={handleSampleSelect}
          className="mb-6 w-full md:w-96 p-2 border rounded"
        >
          <option value="">-- Load Sample Patient --</option>
          {Object.keys(samplePatients).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <div className="grid md:grid-cols-2 gap-4">
          {labels.map((label, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={features[i]}
                onChange={(e) => handleChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>
        )}

        <button
          onClick={runPrediction}
          disabled={loading}
          className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Beaker size={18} />
          {loading ? "Analyzing..." : "Run Diagnosis"}
        </button>

        {result && (
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h4 className={`text-3xl font-black ${result.status === "Malignant" ? "text-red-600" : "text-green-600"}`}>
              {result.status}
            </h4>
            <p className="mt-2">Confidence: <strong>{result.confidence}</strong></p>
            <p className="mt-3 text-slate-600">{result.recommendation}</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 text-sm py-6 text-center">
        © {new Date().getFullYear()} CancerAI — Kirinyaga University | Final Year Project
      </footer>
    </div>
  );
}
