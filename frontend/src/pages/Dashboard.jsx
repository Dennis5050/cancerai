import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("doctor"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CancerAI – Doctor Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {doctor?.full_name || "Doctor"}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">New Diagnosis</h2>
          <p className="text-sm text-gray-500 mb-4">
            Start a new cancer risk assessment.
          </p>
          <button
            onClick={() => navigate("/diagnosis")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Diagnosis
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Diagnosis History</h2>
          <p className="text-sm text-gray-500 mb-4">
            View previous diagnosis records.
          </p>
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          <p className="text-sm text-gray-500 mb-2">
            ML Model: <span className="text-green-600">Active</span>
          </p>
          <p className="text-sm text-gray-500">
            API Status: <span className="text-green-600">Online</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
