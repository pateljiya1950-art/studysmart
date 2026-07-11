import { useEffect, useState, useCallback } from "react";
import "./StudentSessions.css";
import { getStudentSessions, getSessionStatus } from "../../services/sessionApi";

/* ─── JWT decode helper ─────────────────────────────────────────────
   ASP.NET Core JWT uses claim type URI keys, so we try every standard
   variant to find the user ID.
─────────────────────────────────────────────────────────────────── */
function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("[StudentSessions] JWT payload claims:", payload);

    /* ASP.NET Core sets ClaimTypes.NameIdentifier → long URI key */
    const id =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.nameid   ||
      payload.sub      ||
      payload.userId   ||
      payload.user_id  ||
      payload.id       ||
      "";

    const name =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      payload.name          ||
      payload.given_name    ||
      payload.unique_name   ||
      "Student";

    console.log("[StudentSessions] resolved → id:", id, "name:", name);
    return { id: String(id), name };
  } catch (e) {
    console.error("[StudentSessions] failed to decode JWT:", e);
    return null;
  }
}

/* ─── Formatters ────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "–";
  const [y, m, day] = d.split("-");
  return new Date(+y, +m - 1, +day).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}
function fmtTime(t) {
  if (!t) return "–";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ─── Countdown display ─────────────────────────────────────── */
function Countdown({ session }) {
  const [text, setText] = useState("");

  useEffect(() => {
    function calc() {
      const now   = new Date();
      const start = new Date(`${session.sessionDate || session.date}T${session.startTime}:00`);
      const diff  = Math.max(0, Math.floor((start - now) / 1000));
      if (diff === 0) { setText(""); return; }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setText(
        h > 0
          ? `Starts in ${h}h ${m}m`
          : m > 0
          ? `Starts in ${m}m ${s}s`
          : `Starts in ${s}s`
      );
    }
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [session.sessionDate, session.date, session.startTime]);

  if (!text) return null;
  return <span className="ss-countdown">{text}</span>;
}

/* ─── Join Button ───────────────────────────────────────────── */
function JoinButton({ session }) {
  const [status, setStatus] = useState(getSessionStatus(session));

  /* Re-evaluate every second so the button flips live automatically */
  useEffect(() => {
    const iv = setInterval(() => setStatus(getSessionStatus(session)), 1000);
    return () => clearInterval(iv);
  }, [session]);

  if (status === "live") {
    return (
      <a
        href={session.meetingLink}
        target="_blank"
        rel="noreferrer"
        className="ss-join-btn ss-join-active"
      >
        🚀 Join Session
      </a>
    );
  }
  if (status === "before") {
    return (
      <button className="ss-join-btn ss-join-waiting" disabled>
        ⏳ Not Started Yet
      </button>
    );
  }
  return (
    <button className="ss-join-btn ss-join-ended" disabled>
      ✓ Session Ended
    </button>
  );
}

/* ─── Status badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    before: { label: "Upcoming", color: "#06b6d4" },
    live:   { label: "🔴 Live",  color: "#ef4444" },
    ended:  { label: "Ended",    color: "#64748b" },
  };
  const { label, color } = cfg[status] || cfg.ended;
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 20,
        padding: "2px 12px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StudentSessions Component
═══════════════════════════════════════════════════════════════ */
export default function StudentSessions() {
  const me = getCurrentUser();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all"); // all | upcoming | live | ended

  const fetchSessions = useCallback(async () => {
    console.log("[StudentSessions] Fetching sessions...");
    setLoading(true);
    setError("");

    try {
      const data = await getStudentSessions();
      console.log("[StudentSessions] Received sessions:", data);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[StudentSessions] Fetch error:", err.message);
      setError(err.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  /* Re-tick every 30 s so live status badges auto-update */
  useEffect(() => {
    const iv = setInterval(() => setSessions((prev) => [...prev]), 30_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = sessions.filter((s) => {
    if (filter === "all") return true;
    return getSessionStatus(s) === filter;
  });

  const counts = {
    all:      sessions.length,
    before:   sessions.filter((s) => getSessionStatus(s) === "before").length,
    live:     sessions.filter((s) => getSessionStatus(s) === "live").length,
    ended:    sessions.filter((s) => getSessionStatus(s) === "ended").length,
  };

  return (
    <div className="ss-page animate-in">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="ss-header">
        <div>
          <h1 className="ss-title">📅 My Sessions</h1>
          <p className="ss-subtitle">
            Join your live mentoring sessions below
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={fetchSessions}
          title="Refresh"
          style={{ fontSize: 18 }}
        >
          ↺
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* ── Filter tabs ───────────────────────────────────────── */}
      {!loading && sessions.length > 0 && (
        <div className="ss-filter-tabs">
          {[
            { key: "all",    label: `All (${counts.all})`            },
            { key: "before", label: `⏰ Upcoming (${counts.before})`  },
            { key: "live",   label: `🔴 Live (${counts.live})`        },
            { key: "ended",  label: `✓ Ended (${counts.ended})`       },
          ].map((t) => (
            <button
              key={t.key}
              className={`ss-tab ${filter === t.key ? "ss-tab-active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Session Cards ─────────────────────────────────────── */}
      {loading ? (
        <div className="md-spinner">
          <div className="spinner-ring" /> Loading sessions…
        </div>
      ) : sessions.length === 0 ? (
        <div className="ss-empty">
          <span style={{ fontSize: 52 }}>📅</span>
          <p>No sessions scheduled yet.</p>
          <p style={{ fontSize: 13, opacity: 0.6 }}>
            Your mentor will schedule sessions and they'll appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ss-empty">
          <span style={{ fontSize: 40 }}>🔍</span>
          <p>No sessions in this category.</p>
        </div>
      ) : (
        <div className="ss-cards">
          {filtered.map((s) => {
            const status = getSessionStatus(s);
            const isLive = status === "live";
            return (
              <div
                key={s.sessionId}
                className={`ss-card ${isLive ? "ss-card-live" : ""}`}
              >
                {/* Live pulse indicator */}
                {isLive && (
                  <div className="ss-live-indicator">
                    <span className="ss-pulse" /> LIVE
                  </div>
                )}

                {/* Top row */}
                <div className="ss-card-top">
                  <StatusBadge status={status} />
                  {status === "before" && <Countdown session={s} />}
                </div>

                {/* Title */}
                <h3 className="ss-card-title">{s.title}</h3>

                {/* Mentor chip */}
                <div className="ss-mentor-chip">
                  <div className="ss-mentor-avatar">
                    {(s.mentorName || "M")[0].toUpperCase()}
                  </div>
                  <span>{s.mentorName || "Mentor"}</span>
                </div>

                {/* Details grid */}
                <div className="ss-details">
                  <div className="ss-detail">
                    <span className="ss-detail-icon">🗓</span>
                    <div>
                      <div className="ss-detail-label">Date</div>
                      <div className="ss-detail-val">{fmtDate(s.sessionDate || s.date)}</div>
                    </div>
                  </div>
                  <div className="ss-detail">
                    <span className="ss-detail-icon">⏰</span>
                    <div>
                      <div className="ss-detail-label">Time</div>
                      <div className="ss-detail-val">
                        {fmtTime(s.startTime)} — {fmtTime(s.endTime)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Join button */}
                <div className="ss-action">
                  <JoinButton session={s} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
