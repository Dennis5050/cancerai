import { useState } from "react";
import { Activity, Beaker, ClipboardList, ShieldCheck } from "lucide-react";

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

  // Sample patients
  const samplePatients = {
    "Benign #1": [
      12.48, 15.71, 82.57, 477.1, 0.09856, 0.07708, 0.0296, 0.02816, 0.1565, 0.05884,
      0.5781, 1.542, 4.529, 35.68, 0.005895, 0.01785, 0.01127, 0.005678, 0.02261, 0.003863,
      15.12, 20.45, 98.87, 654.1, 0.1283, 0.1819, 0.09676, 0.06496, 0.2416, 0.07386
    ],
    "Malignant #1": [
      17.99, 10.38, 122.8, 1001, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.07871,
      1.095, 0.9053, 8.589, 153.4, 0.006399, 0.04904, 0.05373, 0.01587, 0.03003, 0.006193,
      25.38, 17.33, 184.6, 2019, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601, 0.1189
    ]
    // Add more samples here if needed
  };

  const handleSampleSelect = (e) => {
    const key = e.target.value;
    setSelectedSample(key);
    if (key && samplePatients[key]) {
      setFeatures(samplePatients[key]);
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

  // Validate inputs
  const hasEmpty = features.some(f => f === "" || isNaN(f));

  if (hasEmpty) {
    setError("⚠️ Please fill in all 30 diagnostic features before running analysis.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: features.map(Number) })
    });

    const data = await response.json();

    setResult({
      status: data.prediction,
      confidence: data.confidence || "--",
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Sidebar */}
          <div className="bg-slate-50 w-full md:w-72 p-8 border-r border-slate-100">
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-6">
              <Activity size={24} />
              <span className="tracking-tight text-xl">CancerAI</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="flex-1 p-8">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={24} />
                Patient Diagnostic Input
              </h1>
              <p className="text-slate-500 text-sm">
                Enter digitized morphometric biopsy features or select a sample patient.
              </p>

              {/* Sample Dropdown */}
              <select
                value={selectedSample}
                onChange={handleSampleSelect}
                className="mt-4 w-full p-2 border rounded-md"
              >
                <option value="">-- Select Sample Patient --</option>
                {Object.keys(samplePatients).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {labels.map((label, i) => (
                <div key={i}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{label}</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="0.00"
                    value={features[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
           {error && (
  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
    {error}
  </div>
)}

            <button
              onClick={runPrediction}
              disabled={loading}
              className="mt-10 w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Beaker size={18} />
                  Analyze Sample Data
                </>
              )}
            </button>

            {result && (
              <div className="mt-8">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    Diagnostic Report
                  </span>
                  <h2
                    className={`text-3xl font-black mt-2 ${
                      result.status === "Malignant"
                        ? "text-red-600"
                        : result.status === "Benign"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {result.status}
                  </h2>
                  <p className="mt-2 text-sm text-blue-800">
                    Confidence: <strong>{result.confidence}</strong>
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
