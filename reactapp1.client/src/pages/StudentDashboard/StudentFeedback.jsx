import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaStar } from "react-icons/fa";
import "./MentorDiscovery.css";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, fontSize: 28, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <FaStar
          key={n}
          color={n <= (hover || value) ? "#f59e0b" : "#e2e8f0"}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

export default function StudentFeedbackPage() {
  const [mentors,   setMentors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [rating,    setRating]    = useState(5);
  const [comments,  setComments]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");

  useEffect(() => {
    // load assigned mentors
    authFetch("/student/my-mentors")
      .then(setMentors)
      .catch(() => setError("Failed to load your mentors."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) { setError("Please select a mentor."); return; }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await authFetch("/student/feedback", {
        method: "POST",
        body: JSON.stringify({ mentorId: selected.mentorId, rating, comments })
      });
      setSuccess(`✅ Feedback submitted for ${selected.name}!`);
      setComments(""); setRating(5); setSelected(null);
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md">
      <div className="md-header">
        <div>
          <h1 className="md-title">⭐ Mentor Feedback</h1>
          <p className="md-subtitle">Rate and review your assigned mentors</p>
        </div>
      </div>

      {error   && <div className="md-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
      {success && <div style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

        {/* Mentor List */}
        <div className="md-card">
          <h3 className="md-card-title">Your Mentors</h3>
          {loading ? (
            <div className="md-loading"><div className="md-spinner" /></div>
          ) : mentors.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>No assigned mentors yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {mentors.map(m => (
                <button
                  key={m.mentorId}
                  onClick={() => { setSelected(m); setSuccess(""); setError(""); }}
                  style={{
                    padding: "10px 14px", borderRadius: 10, border: "2px solid",
                    borderColor: selected?.mentorId === m.mentorId ? "#6366f1" : "#e2e8f0",
                    background: selected?.mentorId === m.mentorId ? "#eef2ff" : "white",
                    cursor: "pointer", textAlign: "left", fontWeight: 600,
                    color: selected?.mentorId === m.mentorId ? "#4338ca" : "#1e293b",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontSize: 15 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>{m.department || "Mentor"}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Form */}
        <div className="md-card">
          <h3 className="md-card-title">
            {selected ? `Feedback for ${selected.name}` : "Select a mentor to rate"}
          </h3>
          {!selected ? (
            <div className="md-empty-state" style={{ padding: 40 }}>
              <span style={{ fontSize: 40 }}>👈</span>
              <p>Pick a mentor from the left panel</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                  Your Rating
                </label>
                <StarPicker value={rating} onChange={setRating} />
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                  Comments <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Share your experience with this mentor…"
                  rows={5}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "2px solid #e2e8f0", fontSize: 14, resize: "vertical",
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", borderRadius: 10, fontWeight: 700,
                  fontSize: 15, cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1, alignSelf: "flex-start"
                }}
              >
                {submitting ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}