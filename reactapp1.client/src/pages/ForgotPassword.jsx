import { useState } from "react";
import { forgotPasswordNode, verifyOtpNode, resetPasswordNode } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      const response = await forgotPasswordNode(email);
      setMessage(response.message || response.msg || "OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      const response = await verifyOtpNode(email, otp);
      setMessage(response.msg || "OTP verified.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      const response = await resetPasswordNode(email, otp, newPassword);
      setMessage(response.message || response.msg || "Password reset! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally { setIsLoading(false); }
  };

  const stepLabels = ["Send OTP", "Verify OTP", "Reset Password"];

  return (
    <div className="auth-page" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", fontFamily: "'Inter', sans-serif" }}>
      {/* ── Left Panel ── */}
      <div className="auth-left" style={{ background: "linear-gradient(145deg, #4f46e5 0%, #3b82f6 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", paddingBottom: "40%", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }}></div>
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "60%", paddingBottom: "60%", background: "rgba(99,102,241,0.4)", borderRadius: "50%", filter: "blur(80px)" }}></div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <div className="auth-brand" style={{ marginBottom: "60px" }}>
            <div className="auth-brand-icon" style={{ background: "white", color: "#4f46e5", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>📚</div>
            <span className="auth-brand-name" style={{ color: "white", fontWeight: 800 }}>StudySmart</span>
          </div>
          <h1 className="auth-headline" style={{ color: "white", fontSize: "3rem", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 24px 0" }}>
            Reset Your<br />
            <span style={{ color: "#a5b4fc" }}>Password</span>
          </h1>
          <p className="auth-sub" style={{ color: "#e0e7ff", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "400px", margin: 0 }}>
            No worries! Just enter your registered email and we'll send you a secure OTP to recover your account safely.
          </p>
          <div className="auth-features" style={{ marginTop: "50px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {stepLabels.map((label, idx) => (
              <div key={idx} className="auth-feature-item" style={{ display: "flex", alignItems: "center", gap: "16px", background: step === idx + 1 ? "rgba(255,255,255,0.15)" : "transparent", padding: "12px 20px", borderRadius: "16px", border: step === idx + 1 ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent", transition: "all 0.3s ease" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", background: step > idx ? "#10b981" : (step === idx + 1 ? "#fff" : "rgba(255,255,255,0.2)"), color: step === idx + 1 ? "#4f46e5" : "white", fontWeight: 700, fontSize: "14px", boxShadow: step === idx + 1 ? "0 0 15px rgba(255,255,255,0.3)" : "none" }}>
                   {step > idx ? "✓" : idx + 1}
                </span>
                <span style={{ color: "white", opacity: step >= idx + 1 ? 1 : 0.6, fontWeight: step === idx + 1 ? 700 : 500, fontSize: "1.05rem" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div className="auth-card" style={{ background: "white", padding: "48px", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "440px" }}>
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ width: "64px", height: "64px", background: "#e0e7ff", color: "#4f46e5", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px", boxShadow: "0 8px 16px rgba(79, 70, 229, 0.15)" }}>🔒</div>
              <h2 className="auth-title" style={{ color: "#0f172a", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>Forgot Password</h2>
              <p className="auth-subtitle" style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.5, margin: "0 0 32px 0" }}>Enter the email address associated with your account and we'll send you a 6-digit OTP.</p>
              
              {error && <div className="auth-error" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>⚠</span> {error}</div>}
              {message && <div className="auth-success" style={{ background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>✓</span> {message}</div>}
              
              <form onSubmit={handleSendOtp} noValidate>
                <div className="input-group" style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "1rem", outline: "none", transition: "all 0.2s ease", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#ffffff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(79, 70, 229, 0.25)", transition: "transform 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {isLoading ? <span style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span> : "Send OTP"}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ width: "64px", height: "64px", background: "#dcfce7", color: "#10b981", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px", boxShadow: "0 8px 16px rgba(16, 185, 129, 0.15)" }}>📩</div>
              <h2 className="auth-title" style={{ color: "#0f172a", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>Enter OTP</h2>
              <p className="auth-subtitle" style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.5, margin: "0 0 32px 0" }}>Code safely sent to <strong style={{color:'#4f46e5'}}>{email}</strong></p>
              
              {error && <div className="auth-error" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>⚠</span> {error}</div>}
              {message && <div className="auth-success" style={{ background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>✓</span> {message}</div>}
              
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="input-group" style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    required
                    disabled={isLoading}
                    style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "1.8rem", letterSpacing: "12px", textAlign: "center", fontWeight: 800, outline: "none", transition: "all 0.2s ease", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "#ffffff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  />
                </div>
                <button type="submit" disabled={isLoading || otp.length < 6} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, cursor: (isLoading || otp.length < 6) ? "not-allowed" : "pointer", opacity: (isLoading || otp.length < 6) ? 0.7 : 1, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.25)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {isLoading ? <span style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span> : "Verify OTP"}
                </button>
              </form>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button onClick={() => { setStep(1); setError(''); setMessage(''); }}
                  style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:14, fontWeight: 600 }}>
                  <span style={{ marginRight: 6 }}>←</span> Resend OTP
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ width: "64px", height: "64px", background: "#fef3c7", color: "#f59e0b", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px", boxShadow: "0 8px 16px rgba(245, 158, 11, 0.15)" }}>🔑</div>
              <h2 className="auth-title" style={{ color: "#0f172a", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0" }}>New Password</h2>
              <p className="auth-subtitle" style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.5, margin: "0 0 32px 0" }}>Create a strong, secure password for your account.</p>
              
              {error && <div className="auth-error" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>⚠</span> {error}</div>}
              {message && <div className="auth-success" style={{ background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><span>✓</span> {message}</div>}
              
              <form onSubmit={handleResetPassword} noValidate>
                <div className="input-group" style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "1rem", outline: "none", transition: "all 0.2s ease", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = "#ffffff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  />
                </div>
                <button type="submit" disabled={isLoading || newPassword.length < 6} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, cursor: (isLoading || newPassword.length < 6) ? "not-allowed" : "pointer", opacity: (isLoading || newPassword.length < 6) ? 0.7 : 1, boxShadow: "0 10px 20px rgba(245, 158, 11, 0.25)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {isLoading ? <span style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span> : "Set New Password ✓"}
                </button>
              </form>
            </div>
          )}

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
