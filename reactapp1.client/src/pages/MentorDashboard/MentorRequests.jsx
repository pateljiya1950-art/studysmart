import { useEffect, useState } from "react";
import { getMentorRequests, respondToRequest } from "../../services/mentorApi";
// Styles are handled by MentorLayout.css

export default function MentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");
  const [pending, setPending]   = useState({}); // id → action

  useEffect(() => {
    getMentorRequests()
      .then(setRequests)
      .catch(() => setError("Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const handle = async (id, action) => {
    setPending(p => ({ ...p, [id]: action }));
    try {
      await respondToRequest(id, action);
      setRequests(req => req.filter(r => r.requestId !== id));
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setPending(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <h1>📬 Mentor Requests</h1>
        <p>Review and respond to incoming mentorship requests.</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="md-card">
        <div className="md-card-title">
          <span className="icon">📋</span>
          Pending Requests
          <span className="badge badge-amber" style={{ marginLeft: 8 }}>
            {requests.length}
          </span>
        </div>

        {loading ? (
          <div className="md-spinner"><div className="spinner-ring" /> Loading requests…</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p>No pending requests at the moment.</p>
          </div>
        ) : (
          requests.map(r => (
            <div key={r.requestId} className="request-item">
              <div className="request-info">
                <div className="request-name">{r.studentName}</div>
                <div className="request-skill">
                  🛠️ {r.skill || "General Mentorship"}
                </div>
              </div>
              <div className="request-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handle(r.requestId, "Accepted")}
                  disabled={!!pending[r.requestId]}
                >
                  {pending[r.requestId] === "Accepted" ? "⏳" : "✓"} Accept
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handle(r.requestId, "Rejected")}
                  disabled={!!pending[r.requestId]}
                >
                  {pending[r.requestId] === "Rejected" ? "⏳" : "✕"} Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
