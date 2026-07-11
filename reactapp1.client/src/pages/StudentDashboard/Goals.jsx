import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaBullseye, FaCalendarAlt, FaTasks, FaClock, FaCheckCircle, FaSpinner, FaPlus, FaFlagCheckered } from "react-icons/fa";
import "./Goals.css";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [title, setTitle] = useState("");
  const [targetTasks, setTargetTasks] = useState(5);
  const [targetHours, setTargetHours] = useState(10);

  // Defaults for dates: Start today, end in 7 days
  const todayDateStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayDateStr);
  const [endDate, setEndDate] = useState(nextWeekStr);

  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      // Fetch tasks first to calculate total user completed tasks
      // This synchronizes perfectly with the backend's auto-complete SQL logic!
      const tasksResponse = await authFetch("/tasks");
      const completeCount = (tasksResponse || []).filter(t => (t.status || "").toLowerCase() === "completed").length;
      setCompletedTaskCount(completeCount);

      const data = await authFetch("/student/goals");
      const activeGoals = data || [];

      // ✨ FRONTEND AUTO-COMPLETE SWEEP 
      // If the backend auto-complete logic failed (e.g., pending database rebuilds),
      // the frontend securely sweeps goals to correctly mark them "Completed" when maxed out.
      for (const goal of activeGoals) {
        if ((goal.goalStatus || "Active").toLowerCase() === "active") {
          const target = goal.targetTasks || 0;
          if (target > 0 && completeCount >= target) {
            goal.goalStatus = "Completed"; // Optimistic visual update
            
            // Silently sync the database
            authFetch(`/student/goals/${goal.goalId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify("Completed")
            }).catch(e => console.error("Failed silent sync", e));
          }
        }
      }

      setGoals(activeGoals);
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await authFetch("/student/goals", {
        method: "POST",
        body: JSON.stringify({
          goalTitle: title,
          targetTasks: parseInt(targetTasks, 10),
          targetHours: parseInt(targetHours, 10),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        })
      });

      // Reset form
      setTitle("");
      setTargetTasks(5);
      setTargetHours(10);
      setStartDate(todayDateStr);
      setEndDate(nextWeekStr);

      loadGoals();
    } catch (err) {
      console.error("Failed to create goal", err);
    }
  };

  const updateGoalStatus = async (id, status) => {
    try {
      await authFetch(`/student/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status) 
      });
      loadGoals();
    } catch(err) {
      console.error("Failed to update status", err);
    }
  };

  // Helper for status badge
  const renderStatusBadge = (status) => {
    const s = (status || "Active").toLowerCase();
    if (s === "completed") return <span className="gl-badge gl-badge-success"><FaCheckCircle /> Completed</span>;
    if (s === "failed") return <span className="gl-badge gl-badge-danger">Failed</span>;
    return <span className="gl-badge gl-badge-active"><FaSpinner className="gl-spin" /> Active</span>;
  };

  return (
    <div className="gl">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="gl-header">
        <div>
          <h1 className="gl-title">My Goals</h1>
          <p className="gl-subtitle">Set targets, track your progress, and achieve your milestones.</p>
        </div>
      </div>

      <div className="gl-layout">

        {/* ── CREATE GOAL FORM ────────────────────────────────────── */}
        <div className="gl-side">
          <div className="gl-card gl-create-card">
            <h3 className="gl-card-title">Create New Goal</h3>

            <form className="gl-form" onSubmit={createGoal}>
              <div className="gl-input-group">
                <label>Goal Title</label>
                <div className="gl-input-wrap">
                  <FaBullseye className="gl-input-icon text-rose" />
                  <input
                    placeholder="e.g. React "
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="gl-input-row">
                <div className="gl-input-group">
                  <label>Target Tasks</label>
                  <div className="gl-input-wrap">
                    <FaTasks className="gl-input-icon text-indigo" />
                    <input
                      type="number"
                      min="1"
                      value={targetTasks}
                      onChange={e => setTargetTasks(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="gl-input-group">
                  <label>Target (Hrs)</label>
                  <div className="gl-input-wrap">
                    <FaClock className="gl-input-icon text-emerald" />
                    <input
                      type="number"
                      min="1"
                      value={targetHours}
                      onChange={e => setTargetHours(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="gl-input-group">
                <label>Timeline</label>
                <div className="gl-date-row">
                  <input
                    type="date"
                    className="gl-date-input"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                  <span className="gl-date-sep">to</span>
                  <input
                    type="date"
                    className="gl-date-input"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="gl-btn-add">
                <FaPlus /> Start Goal
              </button>
            </form>
          </div>
        </div>

        {/* ── GOALS GRID ────────────────────────────────────────── */}
        <div className="gl-main">
          {loading ? (
            <div className="gl-empty">
              <div className="gl-spinner-large" />
              <p>Loading your goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="gl-empty">
              <FaFlagCheckered className="gl-empty-icon" />
              <p>You haven't set any goals yet.</p>
              <span>Use the form on the left to set your first target!</span>
            </div>
          ) : (
            <div className="gl-grid">
              {goals.map(goal => (
                <div key={goal.goalId} className="gl-item-card">

                  {/* Card Header */}
                  <div className="gl-item-top">
                    <h4 className="gl-item-title">{goal.goalTitle}</h4>
                    {renderStatusBadge(goal.goalStatus)}
                  </div>

                  {/* Card Body (Targets) */}
                  <div className="gl-item-body">
                    <div className="gl-stat-box text-indigo-box">
                      <FaTasks className="gl-stat-icon" />
                      <div className="gl-stat-info">
                        <span>Tasks Progress</span>
                        <strong>
                           {goal.goalStatus === "Completed" ? goal.targetTasks : Math.min(completedTaskCount, goal.targetTasks || 0)} / {goal.targetTasks || 0}
                        </strong>
                      </div>
                    </div>
                    <div className="gl-stat-box text-emerald-box">
                      <FaClock className="gl-stat-icon" />
                      <div className="gl-stat-info">
                        <span>Target Hours</span>
                        <strong>{goal.targetHours || 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer (Timeline & Actions) */}
                  <div className="gl-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="gl-timeline">
                      <FaCalendarAlt className="gl-time-icon" />
                      <span>
                        {new Date(goal.startDate).toLocaleDateString()} — {new Date(goal.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {(goal.goalStatus || "Active").toLowerCase() === "active" && (
                      <div className="gl-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => updateGoalStatus(goal.goalId, "Failed")}
                          style={{
                            background: "transparent", border: "1px solid #fecaca", color: "#ef4444", 
                            padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600"
                          }}
                        >
                          Mark Failed
                        </button>
                      </div>
                    )}
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