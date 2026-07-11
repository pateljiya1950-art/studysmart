import { useEffect, useState, useRef } from "react";
import StudyTimer from "./StudyTimer";
import { authFetch } from "../../services/authService";
import {
  FaPlus, FaCheck, FaCalendarAlt, FaClock,
  FaClipboardList, FaCheckCircle, FaHourglassHalf, FaTrash,
  FaPlay, FaUserTie, FaUser
} from "react-icons/fa";
import "./Tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [taskDurations, setTaskDurations] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);

  const timerRef = useRef(null);

  // Sync timer running state from localStorage (persists across refresh)
  const syncTimerState = () => {
    const saved = localStorage.getItem("st_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTimerRunning(true);
      setActiveTimerTaskId(parsed.taskId || null);
    } else {
      setTimerRunning(false);
      setActiveTimerTaskId(null);
    }
  };

  const loadDurations = () => {
    setTaskDurations(JSON.parse(localStorage.getItem("st_task_durations_sec") || "{}"));
  };

  const loadTasks = async () => {
    const data = await authFetch("/tasks");
    setTasks(data);
  };

  useEffect(() => { 
    loadTasks(); 
    loadDurations();
    syncTimerState();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    // Block if timer is already running
    if (timerRunning) return;
    
    const res = await authFetch("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, dueDate: dueDate || null })
    });
    // Auto-start the timer, passing the active taskId
    if (timerRef.current && res && res.taskId) {
      await timerRef.current.start(res.taskId);
      setTimerRunning(true);
      setActiveTimerTaskId(res.taskId);
    }
    setTitle("");
    setDueDate("");
    loadTasks();
  };

  const startTask = async (taskId) => {
    if (timerRunning) {
        alert("A timer is already running for another task. Please complete or stop it first!");
        return;
    }
    if (timerRef.current) {
      await timerRef.current.start(taskId);
      setTimerRunning(true);
      setActiveTimerTaskId(taskId);
    }
  };

  const completeTask = async (id) => {
    if (timerRunning && activeTimerTaskId === id) {
      if (timerRef.current && timerRef.current.getSeconds() < 60) {
        alert("Session Exception: You must complete at least 1 minute of the study session before marking this task as done.");
        return;
      }
    }

    await authFetch(`/tasks/${id}/complete`, { method: "PUT" });
    // Auto-stop the timer
    if (timerRef.current) {
      await timerRef.current.stop();
    }
    setTimerRunning(false);
    setActiveTimerTaskId(null);
    loadDurations();
    loadTasks();
  };

  const deleteTask = async (id) => {
    await authFetch(`/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  /* ── derived counts ── */
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = total - completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  /* ── filtered list ── */
  const visible = tasks.filter(t => {
    if (filter === "pending") return t.status !== "Completed";
    if (filter === "completed") return t.status === "Completed";
    return true;
  });

  const mentorTasks = visible.filter(t => t.isMentorTask);
  const personalTasks = visible.filter(t => !t.isMentorTask);

  const renderTask = (task) => {
    const done = task.status === "Completed";
    const isActive = activeTimerTaskId === task.taskId;
    
    return (
      <div key={task.taskId} className={`tk-item ${done ? "tk-item--done" : ""} ${isActive ? "tk-item--active" : ""}`}>
        <div className={`tk-item-dot ${done ? "tk-item-dot--done" : isActive ? "tk-item-dot--active" : "tk-item-dot--pending"}`}>
          {done && <FaCheck style={{ fontSize: 9 }} />}
          {isActive && <div style={{width: 6, height: 6, background: "var(--indigo-600)", borderRadius: "50%", animation: "pulse 1.5s infinite"}} />}
        </div>
        <div className="tk-item-body">
          <p className={`tk-item-title ${done ? "tk-item-title--done" : ""}`}>
            {task.title} {task.isMentorTask && <span style={{fontSize:10, marginLeft: 8, background:"#f59e0b", color:"#fff", padding:"2px 6px", borderRadius:4}}>From: {task.mentorName}</span>}
          </p>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px'}}>
            {task.dueDate && (
              <p className="tk-item-due" style={{marginTop: 0}}>
                <FaClock style={{ fontSize: 10 }} />
                {new Date(task.dueDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            )}
            {taskDurations[task.taskId] > 0 && (
              <span style={{fontSize: "12px", color: "var(--indigo-600)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px"}}>
                 <FaClock style={{fontSize: "10px"}} /> 
                 {Math.floor(taskDurations[task.taskId] / 60)}m {taskDurations[task.taskId] % 60}s logged
              </span>
            )}
          </div>
        </div>
        <div className="tk-item-right" style={{gap: 6}}>
          <span className={`tk-badge ${done ? "tk-badge--done" : "tk-badge--pending"}`}>
            {done ? "Completed" : "Pending"}
          </span>
          
          {!done && !timerRunning && (
            <button className="tk-btn-complete" onClick={() => startTask(task.taskId)} title="Start Study Session" style={{background: "#10b981", color: "white", borderColor: "#10b981"}}>
              <FaPlay style={{fontSize: 10}}/> Start Session
            </button>
          )}

          {!done && (
            <button className="tk-btn-complete" onClick={() => completeTask(task.taskId)} title="Mark as complete">
              <FaCheck /> Done
            </button>
          )}
          
          <button className="tk-btn-delete" onClick={() => deleteTask(task.taskId)} title="Delete task">
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="tk-wrapper">
      
      {/* ── MAIN COLUMN ────────────────────────────────────────── */}
      <div className="tk-main">
        
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className="tk-header">
          <div>
            <h1 className="tk-title">My Tasks</h1>
            <p className="tk-subtitle">Manage and track your daily tasks</p>
          </div>
        </div>



      {/* ── STAT STRIP ──────────────────────────────────────────── */}
      <div className="tk-stats">
        <div className="tk-stat tk-stat--indigo">
          <div className="tk-stat-icon"><FaClipboardList /></div>
          <div>
            <p className="tk-stat-val">{total}</p>
            <p className="tk-stat-lbl">Total</p>
          </div>
        </div>
        <div className="tk-stat tk-stat--rose">
          <div className="tk-stat-icon"><FaHourglassHalf /></div>
          <div>
            <p className="tk-stat-val">{pending}</p>
            <p className="tk-stat-lbl">Pending</p>
          </div>
        </div>
        <div className="tk-stat tk-stat--emerald">
          <div className="tk-stat-icon"><FaCheckCircle /></div>
          <div>
            <p className="tk-stat-val">{completed}</p>
            <p className="tk-stat-lbl">Completed</p>
          </div>
        </div>

        {/* progress bar */}
        <div className="tk-stat-progress">
          <div className="tk-stat-progress-top">
            <span className="tk-stat-progress-label">Progress</span>
            <span className="tk-stat-progress-pct">{pct}%</span>
          </div>
          <div className="tk-progress-bar">
            <div className="tk-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ── ADD TASK FORM ────────────────────────────────────────── */}
      <div className="tk-card">
        <h2 className="tk-card-title">Add New Task</h2>

        {timerRunning && (
          <div style={{
            background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "10px",
            padding: "10px 14px", marginBottom: "14px",
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "13px", color: "#c2410c", fontWeight: "600"
          }}>
            ⏱️ Timer is running for the active task. Complete it first to add a new one.
          </div>
        )}

        <form className="tk-form" onSubmit={addTask}>
          <div className="tk-form-field">
            <label className="tk-form-label">Task Title</label>
            <input
              className="tk-input"
              placeholder={timerRunning ? "Complete current task first..." : "e.g. Read Java Notes"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={timerRunning}
              style={timerRunning ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            />
          </div>
          <div className="tk-form-field tk-form-field--date">
            <label className="tk-form-label">Due Date <span>(optional)</span></label>
            <div className="tk-input-icon-wrap">
              <FaCalendarAlt className="tk-input-icon" />
              <input
                className="tk-input tk-input--date"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                disabled={timerRunning}
                style={timerRunning ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              />
            </div>
          </div>
          <button 
            className="tk-btn-add" 
            type="submit" 
            disabled={timerRunning}
            style={timerRunning ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            <FaPlus /> Add Task
          </button>
        </form>
      </div>

      {/* ── FILTER TABS ──────────────────────────────────────────── */}
      <div className="tk-filters">
        {["all", "pending", "completed"].map(f => (
          <button
            key={f}
            className={`tk-filter-btn ${filter === f ? "tk-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `All (${total})` : f === "pending" ? `Pending (${pending})` : `Completed (${completed})`}
          </button>
        ))}
      </div>

      {/* ── TASK LISTS ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Mentor Tasks Compartment */}
        <div className="tk-list tk-compartment">
          <h3 style={{ fontSize: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "#f59e0b" }}>
            <FaUserTie /> Mentor Assigned Tasks ({mentorTasks.length})
          </h3>
          {mentorTasks.length === 0 ? (
            <div className="tk-empty" style={{ padding: "20px" }}>
              <p style={{ margin: 0, fontSize: 13 }}>No mentor tasks mapped for this filter.</p>
            </div>
          ) : (
            mentorTasks.map(renderTask)
          )}
        </div>

        {/* Personal Tasks Compartment */}
        <div className="tk-list tk-compartment">
          <h3 style={{ fontSize: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--indigo-500)" }}>
            <FaUser /> Personal Tasks ({personalTasks.length})
          </h3>
          {personalTasks.length === 0 ? (
           <div className="tk-empty" style={{ padding: "20px" }}>
              <p style={{ margin: 0, fontSize: 13 }}>No personal tasks found.</p>
            </div>
          ) : (
            personalTasks.map(renderTask)
          )}
        </div>
        
      </div>

      </div> {/* END tk-main */}

      {/* ── SIDEBAR COLUMN ────────────────────────────────────── */}
      <div className="tk-sidebar">
        <StudyTimer ref={timerRef} />
      </div>
    
    </div>
  );
}