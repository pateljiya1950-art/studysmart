import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";

function StarRating({ rating = 0 }) {
  const n = Math.round(rating);
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star ${i < n ? "filled" : "empty"}`}>★</span>
      ))}
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function MentorFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    authFetch("/mentor/feedback")
      .then(setFeedback)
      .catch(() => setError("Failed to load feedback."))
      .finally(() => setLoading(false));
  }, []);

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : null;

  return (
    <div className="animate-in">
      <div className="page-header-row" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>⭐ Student Feedback</h1>
          <p>Ratings and comments from your mentees.</p>
        </div>
        {avgRating && (
          <div className="md-card" style={{ padding: "12px 20px", minWidth: 140, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-secondary)", marginBottom: 6 }}>
              Avg Rating
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--warning)" }}>
              {avgRating} ⭐
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
              {feedback.length} review{feedback.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="md-spinner"><div className="spinner-ring" /> Loading feedback…</div>
      ) : feedback.length === 0 ? (
        <div className="md-card">
          <div className="empty-state">
            <span className="empty-state-icon">⭐</span>
            <p>No feedback received yet. Keep mentoring — reviews will appear here!</p>
          </div>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedback.map((f, i) => (
            <div key={i} className="feedback-card">
              <div className="feedback-student">
                <div className="feedback-avatar">{initials(f.studentName)}</div>
                <div>
                  <div className="feedback-name">{f.studentName || "Anonymous"}</div>
                  <StarRating rating={f.rating} />
                </div>
              </div>
              {f.comments && (
                <div className="feedback-comment">"{f.comments}"</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}