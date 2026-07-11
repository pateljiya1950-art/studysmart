import axios from 'axios';
const API = "https://localhost:7214/api";

const NODE_API = "http://localhost:5000";

/* ================= AUTH ================= */

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function forgotPassword(email) {
  const res = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  
  return await res.json();
}

export async function resetPassword(email, otp, newPassword) {
  const res = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function forgotPasswordNode(email) {
  try {
    const res = await axios.post(`${API}/auth/forgot-password`, { email }, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.msg || error.response?.data?.message || 'Error sending OTP');
  }
}

export async function verifyOtpNode(email, otp) {
  try {
    const res = await axios.post(`${API}/auth/verify-otp`, { email, otp }, {
       headers: { "Content-Type": "application/json" }
    });
    return res.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.msg || error.response?.data?.message || 'Invalid or expired OTP');
  }
}

export async function resetPasswordNode(email, otp, newPassword) {
  try {
    const res = await axios.post(`${API}/auth/reset-password`, { email, otp, newPassword }, {
       headers: { "Content-Type": "application/json" }
    });
    return res.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.msg || error.response?.data?.message || 'Error resetting password');
  }
}

/* ================= GLOBAL AUTH FETCH ================= */

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${url}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorText = await res.text();

    // Try to get a clean message from the response body
    let errorMsg = errorText;
    try {
      const json = JSON.parse(errorText);
      errorMsg = json.message || json.title || errorText;
      // Also append inner error detail if present (for debugging 500s)
      if (json.error) errorMsg += " → " + json.error;
    } catch {
      errorMsg = errorText.replace(/^"|"$/g, "");
    }
    throw new Error(errorMsg || "Request failed");
  }

  // 👇 SAFE JSON HANDLING
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}