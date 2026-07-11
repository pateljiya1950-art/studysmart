import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./MentorDiscovery.css";

const EVENT_TYPES = ["exam", "assignment", "session", "personal"];
const TYPE_LABELS = {
  exam:       "Exam",
  assignment: "Assignment",
  session:    "Mentor Session",
  personal:   "Personal Task"
};
const TYPE_COLORS = {
  exam:       "#10b981", // emerald
  assignment: "#ec4899", // pink
  session:    "#6366f1", // indigo
  personal:   "#f59e0b"  // amber
};
const TYPE_ICONS = {
  exam: "📝", assignment: "📋", session: "📅", personal: "📌"
};

function EventBadge({ type }) {
  const color = TYPE_COLORS[type] || "#64748b";
  const icon  = TYPE_ICONS[type]  || "📌";
  const label = TYPE_LABELS[type] || type;
  
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}33`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
      textTransform: "capitalize"
    }}>
      {icon} {label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function StudentCalendar() {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState("all");
  
  const navigate = useNavigate();

  // New event form
  const [title,    setTitle]    = useState("");
  const [date,     setDate]     = useState("");
  const [saving,   setSaving]   = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    authFetch("/calendar")
      .then(setEvents)
      .catch(() => setError("Failed to load generic calendar events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !date) return;
    setSaving(true); setError("");
    try {
      await authFetch("/calendar", {
        method: "POST",
        body: JSON.stringify({ title, eventType: "Task", eventDate: date })
      });
      setTitle(""); setDate(""); 
      setShowForm(false);
      setSuccess("Personal event added!");
      setTimeout(() => setSuccess(""), 3000);
      fetchEvents();
    } catch (err) {
      setError(err.message || "Failed to add event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (type !== "personal") {
      alert("You can only delete custom personal tasks! Exams and Assignments are managed by your Mentor.");
      return;
    }
    const realId = id.replace("custom_", "");
    if (!window.confirm("Delete this personal task?")) return;
    try {
      await authFetch(`/calendar/${realId}`, { method: "DELETE" });
      fetchEvents();
    } catch {
      setError("Failed to delete event.");
    }
  };

  const handleAction = (type) => {
    if (type === "exam") navigate("/student/exams");
    else if (type === "assignment") navigate("/student/assignments");
    else if (type === "session") navigate("/student/sessions");
  };

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const sorted   = [...filtered].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div className="md">
      {/* Header */}
      <div className="md-header">
        <div>
          <h1 className="md-title">📅 Unified Calendar</h1>
          <p className="md-subtitle">All your Tasks, Exams, Assignments, and Sessions automatically synced in one place.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            padding: "10px 20px", background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            color: "white", border: "none", borderRadius: 10, fontWeight: 700,
            cursor: "pointer", fontSize: 14
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Personal Task"}
        </button>
      </div>

      {error   && <div className="md-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
      {success && <div style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>{success}</div>}

      {/* Add Event Form */}
      {showForm && (
        <div className="md-card" style={{ marginBottom: 24 }}>
          <h3 className="md-card-title">➕ New Personal Task</h3>
          <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 200px auto", gap: 12, alignItems: "flex-end", marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Task Name</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                style={{ width: "100%", padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
                placeholder="Study chapter 4..." />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                style={{ width: "100%", padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={saving}
              style={{ padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "…" : "Add Task"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["all", ...EVENT_TYPES].map(f => {
            const isActive = filter === f;
            const bgStr = isActive ? (TYPE_COLORS[f] || "#6366f1") + "22" : "transparent";
            const borderStr = isActive ? (TYPE_COLORS[f] || "#6366f1") : "var(--border)";
            const colorStr = isActive ? (TYPE_COLORS[f] || "#a78bfa") : "var(--text-secondary)";
            
            return (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px", borderRadius: 20, fontWeight: 600, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${borderStr}`,
                  background: bgStr, color: colorStr, textTransform: "capitalize"
                }}>
                {f === "all" ? "🗂 All Events" : `${TYPE_ICONS[f]} ${TYPE_LABELS[f]}`}
              </button>
            )
        })}
      </div>

      {/* Events */}
      {loading ? (
        <div className="md-loading"><div className="md-spinner" /><p>Syncing all assigned events…</p></div>
      ) : sorted.length === 0 ? (
        <div className="md-empty-state" style={{ flexDirection: "column", gap: 12, padding: 60 }}>
          <span style={{ fontSize: 48 }}>🎉</span>
          <p>No upcoming events found{filter !== "all" ? ` for type "${filter}"` : ""}. You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((ev, i) => (
            <div key={ev.id ?? i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
              background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: (TYPE_COLORS[ev.type] || "#64748b") + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22
              }}>
                {TYPE_ICONS[ev.type] || "📌"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 16 }}>{ev.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{formatDate(ev.date)}</div>
              </div>
              <EventBadge type={ev.type} />
              
              {ev.type === "personal" ? (
                <button onClick={() => handleDelete(ev.id, ev.type)}
                  style={{ background: "#ef444422", border: "1px solid #ef444455", color: "#ef4444", borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "6px 12px", fontWeight: 600 }}
                  title="Delete">✕ Delete</button>
              ) : (
                  <button onClick={() => handleAction(ev.type)}
                  style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 8, cursor: "pointer", fontSize: 13, padding: "6px 14px", fontWeight: 600 }}>
                  View →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
