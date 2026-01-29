import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import ProtectedRoute from "./components/ProtectedRoute";

// Use a single export — either named or default. Let's use default for simplicity
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/diagnosis",
    element: (
      <ProtectedRoute>
        <Diagnosis />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Login />,
  },
]);

export default router;
