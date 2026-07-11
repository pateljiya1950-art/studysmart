import { useState } from "react";
import { resetPasswordNode } from "../services/authService";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./Login.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordNode(token, newPassword);
      setMessage("Password successfully reset! You can now login.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", fontFamily: "'Inter', sans-serif" }}>
      {/* ── Left Panel ── */}
      <div className="auth-left" style={{ background: "linear-gradient(145deg, #f59e0b 0%, #d97706 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", paddingBottom: "40%", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }}></div>
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "60%", paddingBottom: "60%", background: "rgba(251, 191, 36, 0.4)", borderRadius: "50%", filter: "blur(80px)" }}></div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <div className="auth-brand" style={{ marginBottom: "60px" }}>
            <div className="auth-brand-icon" style={{ background: "white", color: "#d97706", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", fontSize: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>📚</div>
            <span className="auth-brand-name" style={{ color: "white", fontWeight: 800, fontSize: "24px", marginLeft: "12px", verticalAlign: "super" }}>StudySmart</span>
          </div>
          <h1 className="auth-headline" style={{ color: "white", fontSize: "3rem", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 24px 0" }}>
            Secure Your<br />
            <span style={{ color: "#fef3c7" }}>Account</span>
          </h1>
          <p className="auth-sub" style={{ color: "#fef3c7", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "400px", margin: 0 }}>
            You're almost there! Create a new strong and secure password to protect your StudySmart account.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div className="auth-card" style={{ background: "white", padding: "48px", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "440px" }}>
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ width: "64px", height: "64px", background: "#fef3c7", color: "#f59e0b", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px", boxShadow: "0 8px 16px rgba(245, 158, 11, 0.15)" }}>🛡️</div>
            <h2 className="auth-title" style={{ color: "#0f172a", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>Set New Password</h2>
            <p className="auth-subtitle" style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.5, margin: "0 0 32px 0" }}>Please type your new password below.</p>
            
            {error && <div className="auth-error" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>⚠</span> {error}</div>}
            {message && <div className="auth-success" style={{ background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>✓</span> {message}</div>}
            
            <form onSubmit={handleReset} noValidate>
              <div className="input-group" style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading || message !== ""}
                  minLength={6}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "1rem", outline: "none", transition: "all 0.2s ease", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = "#ffffff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || message !== ""}
                  minLength={6}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "1rem", outline: "none", transition: "all 0.2s ease", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = "#ffffff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
              </div>
              <button type="submit" disabled={isLoading || message !== ""} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, cursor: (isLoading || message !== "") ? "not-allowed" : "pointer", opacity: (isLoading || message !== "") ? 0.7 : 1, boxShadow: "0 10px 20px rgba(245, 158, 11, 0.25)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {isLoading ? <span style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span> : "Confirm Reset ✓"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: "32px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
            <Link to="/login" style={{ color: "#64748b", textDecoration: "none", fontWeight: 600, fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#0f172a"} onMouseOut={e => e.currentTarget.style.color = "#64748b"}>
              <span>←</span> Back to Login
            </Link>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .auth-page { min-height: 100vh; display: flex; }
        .auth-left { flex: 1; padding: 60px; display: flex; flex-direction: column; justify-content: center; }
        .auth-right { flex: 1; padding: 40px; }
        @media (max-width: 900px) {
          .auth-page { flex-direction: column; }
          .auth-left { padding: 40px 20px; }
          .auth-right { padding: 20px; background: transparent !important; }
        }
      `}} />
    </div>
  );
}
