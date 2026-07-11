import { useEffect, useState, useCallback } from "react";
import "./MentorLayout.css";
import "./Sessions.css";
import {
  createSession,
  getMentorSessions,
  deleteSession,
  getSessionStatus,
} from "../../services/sessionApi";
import { getMentorStudents } from "../../services/mentorApi";

/* ─── JWT decode helper ─────────────────────────────────────── */
function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));

    const id =
      payload.nameid ||
      payload.sub ||
      payload.userId ||
      payload.id ||
      "";

    const name =
      payload.name ||
      payload.unique_name ||
      "Mentor";

    return { id: String(id), name };
  } catch {
    return null;
  }
}

/* ─── Status badge ──────────────────────────────────────────── */
function SessionStatusBadge({ session }) {
  const status = getSessionStatus(session);
  const config = {
    before: { label: "Upcoming", cls: "ssb-upcoming" },
    live: { label: "🔴 Live", cls: "ssb-live" },
    ended: { label: "Ended", cls: "ssb-ended" },
  };
  const { label, cls } = config[status];
  return <span className={`ssb ${cls}`}>{label}</span>;
}

/* ─── Formatters ────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "–";
  const [y, m, day] = d.split("-");
  return new Date(+y, +m - 1, +day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t) {
  if (!t) return "–";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ─── Initial form state ────────────────────────────────────── */
const EMPTY_FORM = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  meetingLink: "",
  studentIds: [],
};

/* ═══════════════════════════════════════════════════════════════ */

export default function MentorSessions() {
  const me = getCurrentUser();

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  /* ── FETCH SESSIONS ─────────────────────────────── */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMentorSessions();
      console.log("Sessions API:", data);

      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();

    getMentorStudents()
      .then(setStudents)
      .catch(() => { });
  }, [fetchSessions]);

  /* ── AUTO CLEAR ALERT ───────────────────────────── */
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  /* ── FORM CHANGE ───────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  /* ── SUBMIT ───────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentIds || form.studentIds.length === 0) {
        setError("Please select at least one student");
        return;
    }
    setSaving(true);
    setError("");

    try {
      await createSession({
        Title: form.title,
        Date: form.date,
        StartTime: form.startTime,
        EndTime: form.endTime,
        MeetingLink: form.meetingLink,
        studentIds: form.studentIds,
      });

      setSuccess("Session(s) created successfully");
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE GROUP ─────────────────────────────── */
  const handleDeleteGroup = async (sessionIds) => {
    if (!window.confirm("Delete this session group for all selected students?")) return;

    setDeleting(true);

    try {
      await Promise.all(sessionIds.map(id => deleteSession(id)));
      setSuccess("Session group deleted");
      fetchSessions();
    } catch {
      setError("Failed to delete some sessions");
    } finally {
      setDeleting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // Group multiple student sessions logically
  const groupedSessions = Object.values(
    sessions.reduce((acc, s) => {
      const key = `${s.title}-${s.date || s.sessionDate}-${s.startTime}`;
      if (!acc[key]) {
        acc[key] = { ...s, studentNames: [s.studentName], sessionIds: [s.sessionId] };
      } else {
        acc[key].studentNames.push(s.studentName);
        acc[key].sessionIds.push(s.sessionId);
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(`${b.date || b.sessionDate}T${b.startTime}`) - new Date(`${a.date || a.sessionDate}T${a.startTime}`));

  /* ─────────────────────────────────────────────── */
  return (
    <div className="animate-in ms-page">

      <div className="ms-page-header">
        <div>
          <h1 className="ms-title">📅 Session Scheduling</h1>
          <p className="ms-subtitle">
            Create and manage live sessions for your students
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "✕ Cancel" : "＋ New Session"}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* FORM */}
      {showForm && (
        <div className="md-card ms-form-card">
          <div className="md-card-title">
            📝 Schedule a New Session
          </div>

          <form onSubmit={handleSubmit} className="ms-form">

            <div className="ms-field ms-field-full">
              <label className="form-label">Session Title <span style={{color: "#ef4444"}}>*</span></label>
              <input
                className="form-input"
                name="title"
                placeholder="e.g. JavaScript Fundamentals"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ms-field ms-field-full">
              <label className="form-label">Select Students <span style={{color: "#ef4444"}}>*</span> <span style={{color: "#94a3b8", fontWeight: "normal", fontSize: "12px"}}>(Hold Ctrl/Cmd to select multiple)</span></label>
              <select
                className="form-select"
                name="studentIds"
                multiple
                value={form.studentIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setForm(f => ({ ...f, studentIds: selected }));
                }}
                required
                style={{height: "140px"}}
              >
                {students.map((st) => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ms-field">
              <label className="form-label">Date <span style={{color: "#ef4444"}}>*</span></label>
              <input
                className="form-input"
                type="date"
                name="date"
                min={today}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ms-field">
              <label className="form-label">Start Time <span style={{color: "#ef4444"}}>*</span></label>
              <input
                className="form-input"
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ms-field">
              <label className="form-label">End Time <span style={{color: "#ef4444"}}>*</span></label>
              <input
                className="form-input"
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ms-field">
              <label className="form-label">Meeting Link <span style={{color: "#ef4444"}}>*</span></label>
              <input
                className="form-input"
                type="url"
                name="meetingLink"
                placeholder="https://zoom.us/j/..."
                value={form.meetingLink}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ms-field ms-field-full ms-submit-row">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Scheduling..." : "📤 Schedule Session"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SESSION LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : groupedSessions.length === 0 ? (
        <p>No sessions</p>
      ) : (
        <div className="ms-cards-grid">
          {groupedSessions.map((s) => {
            const status = getSessionStatus(s);

            return (
              <div key={s.sessionIds[0]} className="ms-session-card">

                <SessionStatusBadge session={s} />

                <h3>{s.title}</h3>

                <div className="ms-meta-row" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontWeight: 600, color: '#333'}}>Attendees:</span>
                  <p style={{margin: 0, padding: 0, fontSize: '0.9rem', color: '#666'}}>
                    {s.studentNames.join(", ")}
                  </p>
                </div>
                <p className="ms-meta-row" style={{marginTop: '10px'}}>{fmtDate(s.sessionDate || s.date)}</p>
                <p className="ms-meta-row">{fmtTime(s.startTime)} - {fmtTime(s.endTime)}</p>

                <a href={s.meetingLink} target="_blank" rel="noreferrer" className="ms-link">
                  Join Link
                </a>

                <div className="ms-card-actions" style={{ marginTop: 15 }}>
                  {status === "live" ? (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer">
                      <button className="btn btn-success">
                        Join Session
                      </button>
                    </a>
                  ) : (
                    <button disabled className="btn ms-disabled-btn">
                      {status === "before"
                        ? "Not Started"
                        : "Ended"}
                    </button>
                  )}

                  <button 
                  className="ms-delete-btn" 
                  disabled={deleting}
                  style={{ position: "relative", top: 0, right: 0, marginTop: 10, alignSelf:"flex-end" }} 
                  onClick={() => handleDeleteGroup(s.sessionIds)}>
                    🗑 Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}