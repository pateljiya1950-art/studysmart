import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaSearch, FaUserPlus, FaGraduationCap, FaMedal, FaClock,
         FaChalkboardTeacher, FaTimes, FaPaperPlane, FaCalendarAlt } from "react-icons/fa";
import "./MentorDiscovery.css";

/* ────────────────── helpers ────────────────── */
function formatTime(t) {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  } catch { return t; }
}

const DAY_COLORS = {
  Mon: "#6366f1", Tue: "#8b5cf6", Wed: "#06b6d4",
  Thu: "#10b981", Fri: "#f59e0b", Sat: "#ec4899"
};

/* ────────────────── Q&A Modal ────────────────── */
function AskQuestionModal({ mentor, onClose }) {
  const [skills,   setSkills]   = useState([]);
  const [slots,    setSlots]    = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    authFetch(`/student/discovery/mentor/${mentor.mentorId}/skills`)
      .then(setSkills).catch(() => {});
    authFetch(`/student/discovery/mentor/${mentor.mentorId}/availability`)
      .then(setSlots).catch(() => {});
  }, [mentor.mentorId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (selectedTopics.length === 0 || !question.trim()) { setError("Please select at least one topic and enter your question."); return; }
    setError(""); setSending(true);
    try {
      await authFetch("/student/mentor-requests", {
        method: "POST",
        body: JSON.stringify({ mentorId: mentor.mentorId, skillIds: selectedTopics })
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#ffffff", border: "1px solid #e2e8f0",
        borderRadius: 24, width: "100%", maxWidth: 540,
        maxHeight: "90vh", overflowY: "auto", padding: 32,
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.05)",
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, boxShadow: "0 4px 10px rgba(79, 70, 229, 0.15)" }}>
              {mentor.name ? mentor.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
                Ask {mentor.name}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                {mentor.department} · {mentor.experienceYears} yrs experience
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            transition: "all 0.2s ease"
          }} 
          onMouseOver={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a" }}
          onMouseOut={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b" }}
          ><FaTimes /></button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: 80, height: 80, background: "#ecfdf5", color: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 20px" }}>✅</div>
            <h3 style={{ color: "#1e293b", margin: "0 0 12px", fontSize: 24, fontWeight: 800 }}>Request Sent Successfully!</h3>
            <p style={{ color: "#64748b", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
              Your connection request has been securely delivered to <strong>{mentor.name}</strong>.
              They will review it and respond shortly.
            </p>
            <button onClick={onClose} style={{ marginTop: 28, background: "#10b981", color: "white", padding: "12px 32px", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}>
              Return to Mentors
            </button>
          </div>
        ) : (
          <>
            {/* Availability Section */}
            {slots.length > 0 && (
              <div style={{ marginBottom: 24, padding: "16px 20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 700, color: "#334155",
                  marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  <FaCalendarAlt style={{ color: "#6366f1", fontSize: 16 }} />
                  Available Hours
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {slots.map(s => (
                    <div key={s.availabilityId} style={{
                      background: `${DAY_COLORS[s.dayOfWeek] || "#6366f1"}12`,
                      border: `1px solid ${DAY_COLORS[s.dayOfWeek] || "#6366f1"}30`,
                      borderRadius: 10, padding: "6px 12px",
                      fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
                    }}>
                      <span style={{ color: DAY_COLORS[s.dayOfWeek] || "#6366f1" }}>
                        {s.dayLabel}
                      </span>
                      <span style={{ color: "#64748b" }}>
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q&A Form */}
            <form onSubmit={handleSend}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1e293b" }}>
                  Topics / Subjects
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {skills.map(s => {
                    const isSelected = selectedTopics.includes(s.skillId);
                    return (
                      <button
                        key={s.skillId}
                        type="button"
                        onClick={() => {
                          setSelectedTopics(prev =>
                            prev.includes(s.skillId)
                              ? prev.filter(id => id !== s.skillId)
                              : [...prev, s.skillId]
                          );
                        }}
                        style={{
                          padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600,
                          cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          background: isSelected ? "#4f46e5" : "#ffffff",
                          color: isSelected ? "#ffffff" : "#475569",
                          border: `2px solid ${isSelected ? "#4f46e5" : "#e2e8f0"}`,
                          boxShadow: isSelected ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none"
                        }}
                      >
                        {s.skillName}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1e293b" }}>
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Hello! I need some guidance on..."
                  rows={4}
                  required
                  style={{
                    width: "100%", borderRadius: 16, resize: "vertical",
                    background: "#f8fafc",
                    border: "2px solid #e2e8f0", color: "#0f172a",
                    padding: "16px", fontSize: 15, boxSizing: "border-box",
                    fontFamily: "inherit", outline: "none",
                    transition: "border-color 0.2s ease"
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#4f46e5"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>

              {error && (
                <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 16, padding: "12px 16px",
                  background: "#fef2f2", borderRadius: 12, border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "white", border: "none", padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 16px rgba(79, 70, 229, 0.25)", transition: "transform 0.2s ease" }}
                >
                  <FaPaperPlane /> {sending ? "Sending…" : "Send Request"}
                </button>
                <button type="button" onClick={onClose}
                  style={{
                    padding: "14px 24px", borderRadius: 14, border: "2px solid #e2e8f0",
                    background: "#ffffff", color: "#64748b", cursor: "pointer", fontSize: 16, fontWeight: 700, transition: "all 0.2s ease"
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────── Availability Popover ─────── */
function AvailabilityBadges({ mentorId }) {
  const [slots,   setSlots]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [shown,   setShown]   = useState(false);

  const toggle = async () => {
    if (!shown && slots === null) {
      setLoading(true);
      try {
        const data = await authFetch(`/student/discovery/mentor/${mentorId}/availability`);
        setSlots(Array.isArray(data) ? data : []);
      } catch { setSlots([]); }
      finally { setLoading(false); }
    }
    setShown(s => !s);
  };

  return (
    <div>
      <button
        onClick={toggle}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          border: "1px solid var(--border)", background: "transparent",
          color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600
        }}
      >
        <FaClock style={{ color: "#06b6d4" }} />
        {loading ? "Loading…" : shown ? "Hide Hours" : "View Hours"}
      </button>

      {shown && slots !== null && (
        <div style={{ marginTop: 10 }}>
          {slots.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No availability set yet.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {slots.map(s => (
                <div key={s.availabilityId} style={{
                  background: `${DAY_COLORS[s.dayOfWeek] || "#6366f1"}15`,
                  border: `1px solid ${DAY_COLORS[s.dayOfWeek] || "#6366f1"}40`,
                  borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600
                }}>
                  <span style={{ color: DAY_COLORS[s.dayOfWeek] || "#6366f1" }}>{s.dayLabel}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 5 }}>
                    {formatTime(s.startTime)}–{formatTime(s.endTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────── Main Page ────────────────── */
export default function MentorDiscovery() {
  const [skills,        setSkills]        = useState([]);
  const [mentors,       setMentors]       = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [askMentor,     setAskMentor]     = useState(null);   // mentor object for modal

  useEffect(() => {
    authFetch("/student/discovery/skills")
      .then(setSkills)
      .catch(() => {});
  }, []);

  const loadMentors = async (skillId) => {
    setLoading(true);
    setSelectedSkill(skillId);
    try {
      const data = await authFetch(`/student/discovery/mentors/${skillId}`);
      setMentors(Array.isArray(data) ? data : []);
    } catch { setMentors([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="md">

      {askMentor && (
        <AskQuestionModal mentor={askMentor} onClose={() => setAskMentor(null)} />
      )}

      {/* Header */}
      <div className="md-header">
        <div>
          <h1 className="md-title">Mentor Discovery</h1>
          <p className="md-subtitle">Find expert mentors, view their availability, and ask questions by topic</p>
        </div>
      </div>

      <div className="md-layout">

        {/* Sidebar: skills */}
        <div className="md-side">
          <div className="md-card">
            <h3 className="md-card-title">Filter by Topic</h3>
            <div style={{ marginBottom: 12, color: "#64748b", fontSize: 13 }}>
              Select a subject to view mentors:
            </div>
            <div className="md-skills-list">
              {skills.length === 0 ? (
                <div className="md-empty-skills">No topics available</div>
              ) : (
                skills.map(skill => (
                  <button
                    key={skill.skillId}
                    className={`md-skill-pill ${skill.skillId === selectedSkill ? "md-skill-pill--active" : ""}`}
                    onClick={() => loadMentors(skill.skillId)}
                  >
                    {skill.skillName}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md-info-block">
            <div className="md-info-icon"><FaGraduationCap /></div>
            <h4>How it works</h4>
            <p>Pick a topic, browse mentors, view their available hours, then send a request to connect and ask your question.</p>
          </div>
        </div>

        {/* Main: mentors */}
        <div className="md-main">
          <div className="md-main-header">
            <h3 className="md-main-title">
              {selectedSkill
                ? `Available Mentors (${mentors.length})`
                : "Select a topic to find mentors"}
            </h3>
          </div>

          {loading ? (
            <div className="md-loading">
              <div className="md-spinner" />
              <p>Finding the best matches…</p>
            </div>
          ) : !selectedSkill ? (
            <div className="md-empty-state">
              <FaChalkboardTeacher className="md-empty-icon" />
              <p>Choose a topic from the left to discover expert mentors ready to help.</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="md-empty-state">
              <FaSearch className="md-empty-icon" />
              <p>No mentors found for this topic right now. Try another subject.</p>
            </div>
          ) : (
            <div className="md-grid">
              {mentors.map(m => (
                <div key={m.mentorId} className="md-mentor-card">

                  {/* Avatar + Name */}
                  <div className="md-mentor-top">
                    <div className="md-mentor-avatar">
                      {m.name ? m.name.charAt(0).toUpperCase() : "M"}
                    </div>
                    <div>
                      <h4 className="md-mentor-name">{m.name}</h4>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {m.department}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="md-mentor-body">
                    <div className="md-mentor-stat">
                      <FaMedal className="md-stat-icon text-indigo" />
                      <div>
                        <span className="md-stat-label">Level</span>
                        <span className="md-mentor-stat-val">{m.proficiencyLevel}</span>
                      </div>
                    </div>
                    <div className="md-mentor-stat">
                      <FaGraduationCap className="md-stat-icon text-emerald" />
                      <div>
                        <span className="md-stat-label">Experience</span>
                        <span className="md-mentor-stat-val">{m.experienceYears} Yrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability toggle */}
                  <div style={{ padding: "8px 0 4px" }}>
                    <AvailabilityBadges mentorId={m.mentorId} />
                  </div>

                  {/* Actions */}
                  <div className="md-mentor-footer" style={{ gap: 8 }}>
                    <button
                      className="md-btn-request"
                      onClick={() => setAskMentor(m)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <FaUserPlus /> Ask / Connect
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}