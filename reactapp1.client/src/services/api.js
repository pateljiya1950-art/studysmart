const BASE_URL = "https://localhost:7214/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Something went wrong");
  }

  if (res.status === 204) return null;

  return res.json();
}