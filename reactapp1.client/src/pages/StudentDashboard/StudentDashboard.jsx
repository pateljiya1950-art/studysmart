import { useEffect, useState } from "react";
import { getStudentDashboard } from "../../services/studentApi";
import Card from "../../components/Card";
import {
  FaCheckCircle, FaClock, FaBookOpen, FaChartLine,
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaFire,
  FaBullseye, FaTasks, FaMedal, FaVideo, FaUserTie
} from "react-icons/fa";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import "./StudentDashboard.css";

const taskBarData = [
  { week: "Wk 1", completed: 4, pending: 2 },
  { week: "Wk 2", completed: 6, pending: 3 },
  { week: "Wk 3", completed: 5, pending: 1 },
  { week: "Wk 4", completed: 8, pending: 2 },
];

/* ─── Module-level cache ─────────────────────────────────── */
let dashboardCache = null;

export default function StudentDashboard() {
  const [data, setData] = useState(dashboardCache?.data || null);
  const [mentors, setMentors] = useState(dashboardCache?.mentors || []);
  const [sessions, setSessions] = useState(dashboardCache?.sessions || []);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!dashboardCache) {
      // no-op: spinner will show below
    } else {
      setRefreshing(true);
    }
    try {
      setError("");
      const [dbRes, mentorsRes, sessionsRes] = await Promise.all([
        getStudentDashboard(),
        import("../../services/authService").then(m => m.authFetch("/student/discovery/my-mentors")),
        import("../../services/authService").then(m => m.authFetch("/student/sessions"))
      ]);

      dashboardCache = { data: dbRes, mentors: mentorsRes, sessions: sessionsRes };
      setData(dbRes);
      setMentors(mentorsRes || []);
      setSessions(sessionsRes || []);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (error) return (
    <div className="db-loading" style={{ flexDirection: "column", gap: 16 }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
      <button
        onClick={() => { dashboardCache = null; loadData(); }}
        style={{
          padding: "10px 24px", background: "#6366f1", color: "white",
          border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer"
        }}
      >
        🔄 Retry
      </button>
    </div>
  );

  if (!data) return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p>Loading your dashboard…</p>
    </div>
  );

  const refreshBar = refreshing ? (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 3,
      background: "linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)",
      backgroundSize: "200% 100%",
      animation: "db-shimmer 1.2s linear infinite",
      zIndex: 9999,
    }} />
  ) : null;

  const pieData = [
    { name: "Completed", value: data.completedTasks ?? 0 },
    { name: "Pending", value: data.pendingTasks ?? 0 },
  ];
  const PIE_COLORS = ["#6366f1", "#e2e8f0"];
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const pct = total > 0 ? Math.round((pieData[0].value / total) * 100) : 0;

  const productivity = data.productivityScore ?? 0;
  const studyMins = data.studyMinutesToday ?? 0;

  return (
    <>
      {refreshBar}
      <div className="db">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="db-header">
          <div>
            <h1 className="db-title">Welcome back, {data.profile?.name} 👋</h1>
            <p className="db-subtitle">Track your progress and stay productive.</p>
          </div>
          <div className="db-date">
            <FaCalendarAlt />
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        {/* ── KPI CARDS ────────────────────────────────────────── */}
        <div className="db-kpi">
          <KpiCard icon={<FaCheckCircle />} color="indigo" title="Completed Tasks" value={data.completedTasks ?? 0} trend="+12%" up={true} />
          <KpiCard icon={<FaClock />} color="rose" title="Pending Tasks" value={data.pendingTasks ?? 0} trend="-2%" up={false} />
          <KpiCard icon={<FaBookOpen />} color="sky" title="Study Today" value={`${studyMins}m`} trend="+15%" up={true} />
          <KpiCard icon={<FaChartLine />} color="emerald" title="Productivity" value={`${productivity}%`} trend="+5%" up={true} />
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────────── */}
        <div className="db-grid">

          {/* ── TASK ACTIVITY BAR CHART ─── */}
          <Card className="db-card--span2">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title"><FaTasks style={{ marginRight: 6, color: "var(--primary-color)" }} />Task Activity</h3>
                <p className="db-card-sub">Completed vs pending tasks by week</p>
              </div>
            </div>
            <div className="db-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskBarData} barSize={16} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dx={-4} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13 }}
                    cursor={{ fill: "rgba(99,102,241,0.04)" }}
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pending" fill="#e0e7ff" name="Pending" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* ── TASK COMPLETION DONUT ─── */}
          <Card>
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title"><FaBullseye style={{ marginRight: 6, color: "var(--primary-color)" }} />Task Completion</h3>
                <p className="db-card-sub">Done vs pending</p>
              </div>
            </div>
            <div className="db-donut-wrap">
              <div className="db-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={54} outerRadius={72}
                      paddingAngle={5} dataKey="value"
                      stroke="none" startAngle={90} endAngle={-270}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]}
                          style={i === 0 ? { filter: "drop-shadow(0 2px 6px rgba(99,102,241,0.3))" } : {}}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13 }}
                      itemStyle={{ color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="db-donut-center">
                <span className="db-donut-pct">{pct}%</span>
                <span className="db-donut-label">Done</span>
              </div>
            </div>
            <div className="db-legend">
              {pieData.map((d, i) => (
                <div key={d.name} className="db-legend-item">
                  <span className="db-legend-dot" style={{ background: PIE_COLORS[i] }} />
                  <span className="db-legend-name">{d.name}</span>
                  <span className="db-legend-val">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── STUDY PROGRESS ─── */}
          <Card>
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title"><FaMedal style={{ marginRight: 6, color: "#f59e0b" }} />Study Progress</h3>
                <p className="db-card-sub">Weekly goal completion</p>
              </div>
              <span className="db-badge db-badge--green">On track</span>
            </div>

            <div className="db-progress-block">
              <div className="db-progress-top">
                <span className="db-progress-pct">{productivity}%</span>
                <span className="db-progress-goal">Goal: 100%</span>
              </div>
              <div className="db-progress-bar">
                <div className="db-progress-fill" style={{ width: `${productivity}%` }} />
              </div>
              <div className="db-progress-footer">
                <span>Last week: 58%</span>
                <span className="db-progress-delta">+{Math.max(0, productivity - 58)}% <FaArrowUp style={{ fontSize: 9 }} /></span>
              </div>
            </div>

            <div className="db-summary">
              <div className="db-summary-row">
                <span>Pending tasks</span>
                <strong>{data.pendingTasks ?? 0}</strong>
              </div>
              <div className="db-summary-row">
                <span>Study time today</span>
                <strong>{studyMins}m</strong>
              </div>
              <div className="db-summary-row">
                <span>Productivity score</span>
                <strong className="db-summary-highlight">{productivity}%</strong>
              </div>
            </div>

            <div className="db-card-footer">
              <FaFire style={{ color: "#f97316" }} />
              You have <b>{data.pendingTasks ?? 0} pending tasks</b> — stay focused!
            </div>
          </Card>

          {/* ── MY MENTORS ─── */}
          <Card>
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title"><FaUserTie style={{ marginRight: 6, color: "#10b981" }} />My Mentors</h3>
                <p className="db-card-sub">Your assigned mentors</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {mentors.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--surface-hover)", borderRadius: 8 }}>
                  No mentors connected yet.
                </div>
              ) : (
                mentors.map(m => (
                  <div
                    key={m.mentorId}
                    onClick={() => setSelectedMentor(m)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      border: "1px solid var(--surface-hover)", borderRadius: 10, cursor: "pointer",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)", fontWeight: 700 }}>
                      {m.name?.charAt(0).toUpperCase() || "M"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>{m.name || "Unknown Mentor"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.department || "Mentor"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>



        </div>
      </div>

      {/* ── MENTOR DETAILS MODAL ─── */}
      {selectedMentor && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000
        }}>
          <div style={{
            background: "var(--bg-card)",
            padding: "2rem", borderRadius: "16px",
            width: "90%", maxWidth: "450px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)",
            position: "relative"
          }}>
            <button
              onClick={() => setSelectedMentor(null)}
              style={{
                position: "absolute", top: "16px", right: "16px",
                background: "transparent", border: "none", fontSize: "20px",
                cursor: "pointer", color: "var(--text-muted)"
              }}
            >
              ×
            </button>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "var(--primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary-color)", fontSize: "32px", fontWeight: 700, margin: "0 auto 1rem"
              }}>
                {selectedMentor.name?.charAt(0).toUpperCase() || "M"}
              </div>
              <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "22px" }}>{selectedMentor.name || "Unknown Mentor"}</h2>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                <p style={{ margin: 0, color: "var(--primary-color)", fontWeight: "500", fontSize: "15px" }}>
                  {selectedMentor.department || "General Department"}
                </p>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px", display: "flex", alignItems: "center" }}>
                  <FaMedal style={{ marginRight: 6 }} /> Experience: {selectedMentor.experienceYears} Years
                </p>
                {selectedMentor.skills && selectedMentor.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "4px" }}>
                    {selectedMentor.skills.map((skill, i) => (
                      <span key={i} style={{ background: "rgba(99,102,241,0.1)", color: "var(--primary-color)", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <button
                onClick={() => { setSelectedMentor(null); window.location.href = "/student/chat"; }}
                style={{ width: "100%", padding: "12px 0", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
function KpiCard({ icon, color, title, value, trend, up }) {
  return (
    <div className={`db-kpi-card db-kpi-card--${color}`}>
      <div className="db-kpi-top">
        <div className={`db-kpi-icon db-kpi-icon--${color}`}>{icon}</div>
        <span className={`db-kpi-trend ${up ? "db-kpi-trend--up" : "db-kpi-trend--down"}`}>
          {up ? <FaArrowUp style={{ fontSize: 9 }} /> : <FaArrowDown style={{ fontSize: 9 }} />}
          {trend}
        </span>
      </div>
      <p className="db-kpi-value">{value}</p>
      <p className="db-kpi-title">{title}</p>
      <p className="db-kpi-footer">vs last week</p>
    </div>
  );
}