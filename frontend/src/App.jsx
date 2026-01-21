import { useState } from "react";
import { Activity, Beaker, ClipboardList, ShieldCheck } from "lucide-react";

export default function App() {
  const [features, setFeatures] = useState(Array(30).fill("")); // 30 features
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 30 features labels from WDBC dataset
  const labels = [
    "Mean Radius", "Mean Texture", "Mean Perimeter", "Mean Area", "Mean Smoothness",
    "Mean Compactness", "Mean Concavity", "Mean Concave Points", "Mean Symmetry", "Mean Fractal Dimension",
    "SE Radius", "SE Texture", "SE Perimeter", "SE Area", "SE Smoothness",
    "SE Compactness", "SE Concavity", "SE Concave Points", "SE Symmetry", "SE Fractal Dimension",
    "Worst Radius", "Worst Texture", "Worst Perimeter", "Worst Area", "Worst Smoothness",
    "Worst Compactness", "Worst Concavity", "Worst Concave Points", "Worst Symmetry", "Worst Fractal Dimension"
  ];

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const runPrediction = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: features.map(Number)
        })
      });

      const data = await response.json();
      console.log("AI Response:", data);

      if (data.error) {
        setResult({
          status: "Error",
          confidence: "--",
          recommendation: data.error
        });
      } else {
        setResult({
          status: data.prediction,
          confidence: data.confidence || "N/A",
          recommendation:
            data.prediction === "Benign"
              ? "Routine follow-up recommended in 6 months."
              : "Immediate oncologist consultation advised."
        });
      }

    } catch (error) {
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

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Methodology
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Random Forest AI trained on Wisconsin Diagnostic Dataset.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ShieldCheck size={16} className="text-green-500" />
                  HIPAA Compliant System
                </div>
              </div>
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
                Enter digitized morphometric biopsy features.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {labels.map((label, i) => (
                <div key={i}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    {label}
                  </label>
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

            {/* Result */}
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

        {/* Footer */}
        <footer className="bg-slate-50 px-8 py-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">
          <span>Kirinyaga University — Clinical AI Dept</span>
          <span>Version 2.1.0-AI</span>
        </footer>
      </div>
    </div>
  );
}
