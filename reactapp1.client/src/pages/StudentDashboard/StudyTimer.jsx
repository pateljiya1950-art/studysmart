import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { authFetch } from "../../services/authService";
import { FaPlay, FaStop, FaRedo, FaClock, FaFire, FaCheckCircle } from "react-icons/fa";
import "./StudyTimer.css";

/* ── helpers ─────────────────────────────────────────────── */
function fmt(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [
    h > 0 ? String(h).padStart(2, "0") : null,
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].filter(Boolean).join(":");
}

/* SVG ring: radius 90, circumference ≈ 565 */
const R   = 90;
const CIRC = 2 * Math.PI * R;
const SESSION_GOAL = 25 * 60; // 25-min Pomodoro visual goal

export default forwardRef(function StudyTimer(props, ref) {
  const [sessionId,  setSessionId]  = useState(null);
  const [seconds,    setSeconds]    = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [sessions,   setSessions]   = useState(() => {
    // Use cached value from localStorage as initial render to avoid flicker
    const cached = localStorage.getItem("st_sessions_today");
    return cached ? parseInt(cached, 10) : 0;
  });
  const [lastSecs,   setLastSecs]   = useState(null); 
  const [activeTaskId, setActiveTaskId] = useState(null);
  
  const timerInterval = useRef(null);

  const isRunning = !!sessionId;

  const loadTodayStats = async () => {
    try {
      const stats = await authFetch("/study-sessions/today");
      if (stats && typeof stats.count === "number") {
        setSessions(stats.count);
        // Always sync the DB count to localStorage
        localStorage.setItem("st_sessions_today", stats.count.toString());
      }
    } catch (e) {
      console.warn("Failed to fetch today stats", e);
    }
  };

  // Mount logic: Reclaim timer if active in localStorage
  useEffect(() => {
    const savedLast = localStorage.getItem("st_last_secs");
    if (savedLast) setLastSecs(parseInt(savedLast, 10));

    const saved = localStorage.getItem("st_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      // parsed could be old or new format, gracefully handle
      const sId = parsed.sessionId;
      const sTime = parsed.startTime;
      const tId = parsed.taskId || null;

      if (sId && sTime) {
        setSessionId(sId);
        setActiveTaskId(tId);
        setSeconds(Math.floor((Date.now() - sTime) / 1000));
        
        timerInterval.current = setInterval(() => {
          setSeconds(Math.floor((Date.now() - sTime) / 1000));
        }, 1000);
        setIntervalId(timerInterval.current);
      }
    }

    // load stats from DB on fresh render
    loadTodayStats();

    return () => {
      // Do NOT clear localStorage on unmount, only interval so it resumes safely
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  /* ── API actions ────────────────────────────────────────── */
  const start = async (taskId = null) => {
    if (sessionId) return; // Prevent double-trigger

    const session = await authFetch("/study-sessions/start", { method: "POST" });
    const sId = session.sessionId;
    const sTime = Date.now();

    setSessionId(sId);
    setActiveTaskId(taskId);
    setSeconds(0);

    localStorage.setItem("st_session", JSON.stringify({
      sessionId: sId,
      startTime: sTime,
      taskId: taskId
    }));

    timerInterval.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - sTime) / 1000));
    }, 1000);
    setIntervalId(timerInterval.current);
  };

  const stop = async () => {
    if (!sessionId) return;
    
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    const minutes = Math.floor(seconds / 60);
    await authFetch(`/study-sessions/${sessionId}/stop`, {
      method: "PUT",
      body: JSON.stringify(minutes),
    });

    // Record total duration in SECONDS for the specific task linked to this session
    if (activeTaskId) {
       const stored = JSON.parse(localStorage.getItem("st_task_durations_sec") || "{}");
       stored[activeTaskId] = (stored[activeTaskId] || 0) + seconds;
       localStorage.setItem("st_task_durations_sec", JSON.stringify(stored));
    }

    setLastSecs(seconds);
    localStorage.setItem("st_last_secs", seconds.toString());
    
    setSessions(prev => {
      const updated = prev + 1;
      localStorage.setItem("st_sessions_today", updated.toString());
      return updated;
    });
    // Silent re-sync with db backend
    loadTodayStats();
    
    setSeconds(0);
    setSessionId(null);
    setActiveTaskId(null);
    
    localStorage.removeItem("st_session");
  };

  useImperativeHandle(ref, () => ({
    start: (taskId) => start(taskId),
    stop: () => stop(),
    isRunning: () => !!sessionId,
    getSeconds: () => seconds
  }));

  const reset = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      setIntervalId(null);
    }
    setSessionId(null);
    setActiveTaskId(null);
    setSeconds(0);
    localStorage.removeItem("st_session");
  };

  /* ── ring progress (caps at 100% at goal) ─────────────── */
  const progress  = Math.min(seconds / SESSION_GOAL, 1);
  const dashOffset = CIRC * (1 - progress);

  return (
    <div className="st">

      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="st-header">
        <div>
          <h1 className="st-title">Study Timer</h1>
          <p className="st-subtitle">Stay focused — track every second</p>
        </div>
        {isRunning && (
          <span className="st-live-badge">
            <span className="st-live-dot" /> Live
          </span>
        )}
      </div>

      {/* ── STATS STRIP ─────────────────────────────────── */}
      <div className="st-stats">
        <div className="st-stat">
          <div className="st-stat-icon st-stat-icon--indigo"><FaClock /></div>
          <div>
            <p className="st-stat-val">{fmt(seconds)}</p>
            <p className="st-stat-lbl">Current session</p>
          </div>
        </div>
        <div className="st-stat">
          <div className="st-stat-icon st-stat-icon--emerald"><FaCheckCircle /></div>
          <div>
            <p className="st-stat-val">{sessions}</p>
            <p className="st-stat-lbl">Sessions today</p>
          </div>
        </div>
        <div className="st-stat">
          <div className="st-stat-icon st-stat-icon--orange"><FaFire /></div>
          <div>
            <p className="st-stat-val">{lastSecs !== null ? fmt(lastSecs) : "—"}</p>
            <p className="st-stat-lbl">Last session</p>
          </div>
        </div>
      </div>

      {/* ── TIMER CARD ──────────────────────────────────── */}
      <div className="st-card">

        <p className="st-goal-hint">Goal: 25 min focused session</p>

        {/* Ring */}
        <div className="st-ring-wrap">
          <svg className="st-ring-svg" viewBox="0 0 200 200">
            {/* track */}
            <circle cx="100" cy="100" r={R} className="st-ring-track" />
            {/* progress */}
            <circle
              cx="100" cy="100" r={R}
              className={`st-ring-progress ${isRunning ? "st-ring-progress--active" : ""}`}
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
            />
          </svg>

          {/* Center display */}
          <div className="st-ring-center">
            <span className="st-time">{fmt(seconds)}</span>
            <span className="st-time-label">
              {isRunning ? "Studying…" : seconds > 0 ? "Paused" : "Ready"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="st-controls">
          <button
            className="st-btn st-btn--reset"
            onClick={reset}
            title="Reset timer"
            style={{ width: "100%" }}
          >
            <FaRedo /> Reset Automated Timer
          </button>
        </div>

        {/* Last session banner */}
        {lastSecs !== null && (
          <div className="st-result">
            <FaCheckCircle className="st-result-icon" />
            Great work! Last session: <strong>{Math.floor(lastSecs / 60)}m {lastSecs % 60}s</strong> logged.
          </div>
        )}
      </div>

      {/* ── TIPS ────────────────────────────────────────── */}
      <div className="st-tips">
        <p className="st-tips-title">Pomodoro Tips</p>
        <div className="st-tips-grid">
          {[
            { emoji: "🎯", tip: "Work in focused 25-min sprints" },
            { emoji: "☕", tip: "Take a 5-min break between sessions" },
            { emoji: "📵", tip: "Put your phone face-down" },
            { emoji: "💧", tip: "Stay hydrated while studying" },
          ].map(({ emoji, tip }) => (
            <div key={tip} className="st-tip">
              <span className="st-tip-emoji">{emoji}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});