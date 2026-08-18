import { useState } from "react";
import { login, authFetch } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // Store token first so authFetch can read it
      if (data.role === "student") {
        const r = await authFetch("/student/has-profile", {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        navigate(r?.hasProfile ? "/student/dashboard" : "/student/profile");
      } else if (data.role === "mentor") {
        const r = await authFetch("/mentor/has-profile", {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        navigate(r?.hasProfile ? "/mentor/dashboard" : "/mentor/profile");
      } else if (data.role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">📚</div>
          <h2>Welcome back 👋</h2>
          <p>Sign in to your StudySmart account</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={submitLogin}>
          <div className="auth-input-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-options">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}