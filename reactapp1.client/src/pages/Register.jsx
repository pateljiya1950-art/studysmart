import { useState } from "react";
import { register } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) return "Password must contain a letter and a number";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);

    const error = validate();
    if (error) { setMsg(error); return; }

    try {
      setLoading(true);
      await register({ name, email, password, role });
      setIsSuccess(true);
      setMsg("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h2>Create account</h2>
          <p>Join StudySmart — it's free</p>
        </div>

        {msg && (
          <div className={isSuccess ? "auth-success" : "auth-error"}>
            <span>{isSuccess ? "✓" : "⚠"}</span> {msg}
          </div>
        )}

        {/* Role Toggle */}
        <div className="auth-role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={role === "mentor" ? "active" : ""}
            onClick={() => setRole("mentor")}
          >
            🧑‍🏫 Mentor
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-input-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-input-group" style={{ marginBottom: "2rem" }}>
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Min. 6 characters (letter + number)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : `Create ${role === "student" ? "Student" : "Mentor"} Account`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
