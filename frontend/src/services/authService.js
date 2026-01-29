 // your backend auth base URL

const API_URL = import.meta.env.VITE_API_URL + "/auth"; // Vite syntax




// ---------------------- Login ----------------------
export const loginDoctor = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("token", data.access_token); // save JWT
  return data;
};

// ---------------------- Register ----------------------
export const registerDoctor = async ({ full_name, email, password, license_number }) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, license_number }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Registration failed");
  }

  return await response.json();
};

// ---------------------- Logout ----------------------
export const logoutDoctor = () => {
  localStorage.removeItem("token");
};
