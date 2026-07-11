import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";

/* ── tiny helpers ────────────────────────────── */
function StatCard({ icon, value, label, color = "var(--accent)", sub }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{
        fontSize: 32, fontWeight: 800, lineHeight: 1,
        background: `linear-gradient(135deg, ${color}, var(--accent-2))`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>{value ?? "—"}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary, #94a3b8)", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted, #64748b)", marginTop: 2 }}>{sub}</div>}
      <div style={{
        position: "absolute", right: -10, top: -10,
        width: 60, height: 60, borderRadius: "50%",
        background: `${color}18`
      }} />
    </div>
  );
}

function RatingBar({ star, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ width: 14, textAlign: "right", fontSize: 13, color: "var(--text-secondary)" }}>{star}</span>
      <span style={{ color: "#f59e0b", fontSize: 13 }}>★</span>
      <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #f59e0b, #d97706)",
          borderRadius: 99, transition: "width .7s ease"
        }} />
      </div>
      <span style={{ width: 28, fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>{count}</span>
    </div>
  );
}

function FeedbackCard({ item }) {
  const stars = Math.round(Number(item.rating) || 0);
  return (
    <div style={{
      background: "var(--bg-card-hover)",
      border: "1px solid var(--border)",
      borderRadius: 12, padding: "14px 16px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          {item.studentName || "Student"}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {item.date ? new Date(item.date).toLocaleDateString() : ""}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < stars ? "#f59e0b" : "#374151", fontSize: 15 }}>★</span>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {item.comments || <em style={{ opacity: .5 }}>No comment provided.</em>}
      </p>
    </div>
  );
}

/* ── main component ──────────────────────────── */
export default function MentorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/mentor/analytics")
      .then(d => setData(d))
      .catch(err => setError(err.message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="animate-in">
      <div className="md-spinner"><div className="spinner-ring" /> Loading analytics…</div>
    </div>
  );

  if (error) return (
    <div className="animate-in">
      <div className="alert alert-error">⚠️ {error}</div>
    </div>
  );

  if (!data || data.isEmpty) return (
    <div className="animate-in">
      <div className="page-header"><h1>📊 Analytics</h1></div>
      <div className="md-card">
        <div className="empty-state">
          <span className="empty-state-icon">📊</span>
          <p>No analytics data yet. Start mentoring to see your stats here.</p>
        </div>
      </div>
    </div>
  );

  const totalRatings = data.feedbackCount || 1;
  const avgRating = Number(data.avgStudentRating || 0);

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="page-header">
        <h1>📊 Mentor Analytics</h1>
        <p>Your complete performance overview — students, sessions, and feedback.</p>
      </div>

      {/* ── Row 1: Primary KPIs ────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard icon="🎓" value={data.totalStudents} label="Total Students" color="var(--accent)" sub="Currently assigned" />
        <StatCard icon="📅" value={data.totalSessions} label="Total Sessions" color="var(--accent-2)" sub={`${data.completedSessions} completed`} />
        <StatCard icon="⏳" value={data.upcomingSessions} label="Upcoming Sessions" color="#06b6d4" />
        <StatCard icon="📬" value={data.pendingRequests} label="Pending Requests" color="#f59e0b" />
        <StatCard icon="📝" value={data.totalExams} label="Exams Created" color="#10b981" />
        <StatCard icon="📋" value={data.totalAssignments} label="Assignments Created" color="#ec4899" />
        <StatCard icon="🕐" value={data.availabilitySlots} label="Availability Slots" color="#14b8a6" />
        <StatCard icon="💬" value={data.feedbackCount} label="Feedback Received" color="#f97316" />
      </div>

      {/* ── Row 2: Rating + Recent Feedback ────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>

        {/* Rating Panel */}
        <div className="md-card">
          <div className="md-card-title"><span className="icon">⭐</span> Student Rating</div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 56, fontWeight: 900, lineHeight: 1,
                color: "#f59e0b", letterSpacing: -2
              }}>{avgRating.toFixed(1)}</div>
              <div style={{ fontSize: 18, letterSpacing: 2, color: "#f59e0b", marginTop: 4 }}>
                {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                {data.feedbackCount} review{data.feedbackCount !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <RatingBar star={5} count={data.rating5Count} max={totalRatings} />
              <RatingBar star={4} count={data.rating4Count} max={totalRatings} />
              <RatingBar star={3} count={data.rating3Count} max={totalRatings} />
              <RatingBar star={2} count={data.rating2Count} max={totalRatings} />
              <RatingBar star={1} count={data.rating1Count} max={totalRatings} />
            </div>
          </div>

          {/* Progress bar: completion rate */}
          {data.totalSessions > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Session Completion Rate
              </div>
              <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${(data.completedSessions / data.totalSessions) * 100}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  transition: "width .8s ease"
                }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                {data.completedSessions} of {data.totalSessions} sessions completed
                ({Math.round((data.completedSessions / data.totalSessions) * 100)}%)
              </div>
            </>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="md-card">
          <div className="md-card-title"><span className="icon">💬</span> Recent Student Feedback</div>
          {data.recentFeedback && data.recentFeedback.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.recentFeedback.map(f => (
                <FeedbackCard key={f.feedbackId} item={f} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <span className="empty-state-icon" style={{ fontSize: 28 }}>💬</span>
              <p>No feedback received yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Summary Table ──────────────────────── */}
      <div className="md-card">
        <div className="md-card-title"><span className="icon">📋</span> Full Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["🎓", "Total Students Assigned", data.totalStudents],
              ["📅", "Total Sessions", data.totalSessions],
              ["✅", "Completed Sessions", data.completedSessions],
              ["⏳", "Upcoming Sessions", data.upcomingSessions],
              ["📬", "Pending Requests", data.pendingRequests],
              ["📝", "Exams Created", data.totalExams],
              ["📋", "Assignments Given", data.totalAssignments],
              ["🕐", "Active Availability Slots", data.availabilitySlots],
              ["💬", "Feedback Received", data.feedbackCount],
              ["⭐", "Average Student Rating", `${avgRating.toFixed(2)} / 5.00`],
            ].map(([icon, label, val]) => (
              <tr key={label} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "11px 0 11px 4px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>{label}
                </td>
                <td style={{ padding: "11px 0", fontWeight: 700, color: "var(--text-primary)", textAlign: "right" }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}