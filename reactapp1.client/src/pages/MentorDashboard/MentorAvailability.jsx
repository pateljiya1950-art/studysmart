import { useEffect, useState } from "react";
import { getMentorAvailability, addMentorAvailability, deleteMentorAvailability } from "../../services/mentorApi";

// DB CHECK constraint only accepts these short codes (no Sunday)
const DAY_MAP = [
  { label: "Monday",    code: "Mon" },
  { label: "Tuesday",   code: "Tue" },
  { label: "Wednesday", code: "Wed" },
  { label: "Thursday",  code: "Thu" },
  { label: "Friday",    code: "Fri" },
  { label: "Saturday",  code: "Sat" },
];

// DB short code → full label for display
const CODE_TO_LABEL = Object.fromEntries(DAY_MAP.map(d => [d.code, d.label]));

// Sort order by DB code
const CODE_ORDER = DAY_MAP.map(d => d.code);

function formatTime(t) {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    const suffix = hr >= 12 ? "PM" : "AM";
    const display = hr % 12 || 12;
    return `${display}:${m} ${suffix}`;
  } catch { return t; }
}

function dayIcon(code = "") {
  if (code === "Sat") return "🌅";
  if (code === "Mon") return "🌙";
  return "⚡";
}

export default function MentorAvailability() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Default selected day is "Mon" (DB code)
  const [newDay,   setNewDay]   = useState("Mon");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd,   setNewEnd]   = useState("17:00");
  const [saving,   setSaving]   = useState(false);

  const fetchSlots = () => {
    setLoading(true);
    setError("");
    getMentorAvailability()
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || "Failed to load availability."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();

    // Validate selected day is a known DB code
    if (!CODE_ORDER.includes(newDay)) {
      setError("Invalid day selected.");
      return;
    }

    if (newStart >= newEnd) {
      setError("Start time must be before end time.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      // Send the DB short code directly
      await addMentorAvailability({
        dayOfWeek: newDay,      // "Mon", "Tue", etc.
        startTime: newStart,    // "09:00"
        endTime:   newEnd       // "17:00"
      });
      fetchSlots();
    } catch (err) {
      setError(err?.message || "Failed to add slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Delete this availability slot?")) return;
    setError("");
    try {
      await deleteMentorAvailability(id);
      fetchSlots();
    } catch (err) {
      setError(err?.message || "Failed to remove slot.");
    }
  };

  const sorted = [...slots].sort(
    (a, b) => CODE_ORDER.indexOf(a.dayOfWeek) - CODE_ORDER.indexOf(b.dayOfWeek)
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>🕐 Availability</h1>
        <p>Your weekly availability slots visible to students.</p>
      </div>

      <div className="md-card" style={{ marginBottom: 24 }}>
        <div className="md-card-title"><span className="icon">➕</span> Add Availability Slot</div>
        <form onSubmit={handleAddSlot} className="form-grid" style={{ alignItems: "flex-end" }}>

          <div className="form-group">
            <label className="form-label">Day of Week</label>
            <select
              className="form-select"
              value={newDay}
              onChange={e => setNewDay(e.target.value)}
            >
              {DAY_MAP.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className="form-input"
              type="time"
              value={newStart}
              onChange={e => setNewStart(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className="form-input"
              type="time"
              value={newEnd}
              onChange={e => setNewEnd(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
              style={{ width: "100%" }}
            >
              {saving ? "Adding..." : "Add Slot"}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="md-spinner"><div className="spinner-ring" /> Loading availability…</div>
      ) : sorted.length === 0 ? (
        <div className="md-card">
          <div className="empty-state">
            <span className="empty-state-icon">🕐</span>
            <p>No availability slots set. Add your schedule to allow bookings.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            ℹ️ Showing {sorted.length} slot{sorted.length !== 1 ? "s" : ""}
          </div>
          <div className="avail-grid">
            {sorted.map(s => (
              <div key={s.availabilityId} className="avail-slot">
                <div className="avail-slot-icon">{dayIcon(s.dayOfWeek)}</div>
                <div>
                  {/* Show full day name in UI, store short code in DB */}
                  <div className="avail-day">
                    {CODE_TO_LABEL[s.dayOfWeek] ?? s.dayOfWeek}
                  </div>
                  <div className="avail-time">
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSlot(s.availabilityId)}
                  title="Remove slot"
                  style={{
                    marginLeft: "auto", background: "transparent", border: "none",
                    color: "var(--danger)", cursor: "pointer", fontSize: "16px",
                    padding: "4px 8px", borderRadius: "4px"
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}