export function setAuth(token, role) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
