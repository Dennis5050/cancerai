import { Link } from "react-router-dom";
import { Activity, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center p-6">
      <div className="max-w-3xl">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Activity size={42} className="text-blue-600" />
          <h1 className="text-4xl font-black text-slate-900">CancerAI</h1>
        </div>

        <p className="text-lg text-slate-600 mb-10">
          An AI-powered clinical decision support system for early breast cancer detection.
          Built for hospitals, doctors and medical researchers.
        </p>

        <div className="flex justify-center gap-6">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Doctor Login
          </Link>

          <Link
            to="/register"
            className="px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Register Doctor
          </Link>
        </div>

        <div className="mt-12 flex justify-center items-center gap-2 text-slate-500 text-sm">
          <ShieldCheck className="text-green-500" size={16} />
          HIPAA Compliant Medical AI System
        </div>
      </div>
    </div>
  );
}
