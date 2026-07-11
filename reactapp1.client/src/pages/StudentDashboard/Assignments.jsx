import { useEffect, useState } from "react";
import { getStudentAssignments, submitStudentAssignment } from "../../services/examAssignmentApi";
import "./Assignments.css";

/* ── helpers ── */
function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function isOverdue(dt) {
  return dt && new Date(dt) < new Date();
}

/* ── component ── */
export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tabs: "pending" or "completed"
  const [activeTab, setActiveTab] = useState("pending");

  // Track per-assignment submission state: { [id]: "idle" | "submitting" | "submitted" | "error" }
  const [submitState, setSubmitState] = useState({});
  // Track selected files: { [id]: File }
  const [selectedFiles, setSelectedFiles] = useState({});

  /* ─ load ─ */
  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await getStudentAssignments();
      // Sort: non-submitted first, then by due date ascending
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.isSubmitted !== b.isSubmitted) return a.isSubmitted ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      setAssignments(sorted);
      // seed submit state from server data
      const seed = {};
      sorted.forEach(a => {
        seed[a.assignmentId] = a.isSubmitted ? "submitted" : "idle";
      });
      setSubmitState(seed);
    } catch (err) {
      setError(err.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  /* ─ file selection ─ */
  const handleFileChange = (id, file) => {
    setSelectedFiles(prev => ({ ...prev, [id]: file }));
  };

  /* ─ submit ─ */
  async function handleSubmit(id) {

    if (submitState[id] === "submitting" || submitState[id] === "submitted") return;

    const fileToUpload = selectedFiles[id];
    if (!fileToUpload) {
      setError("Please select a file to upload before submitting.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setSubmitState(prev => ({ ...prev, [id]: "submitting" }));
    setError("");
    setSuccess("");

    try {

      const resp = await submitStudentAssignment(id, fileToUpload);
      setSubmitState(prev => ({ ...prev, [id]: "submitted" }));
      setSuccess(resp?.message || "Assignment and file submitted successfully!");
      // clear the selected file
      setSelectedFiles(prev => ({ ...prev, [id]: null }));

      // Reload to get fresh data from server
      await loadAssignments();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.log(err.message);
      setSubmitState(prev => ({ ...prev, [id]: "error" }));
      setError(err.message || "Failed to submit assignment.");
      // reset after 3 s so user can retry
      setTimeout(() => setSubmitState(prev => ({ ...prev, [id]: "idle" })), 3000);
    }
  }

  /* ─ counts ─ */
  const total = assignments.length;
  const submitted = assignments.filter(a => a.isSubmitted || submitState[a.assignmentId] === "submitted").length;
  const overdue = assignments.filter(a => isOverdue(a.dueDate) && !a.isSubmitted).length;
  const pending = total - submitted;

  // Filter based on active tab
  const visibleAssignments = assignments.filter(a => {
    const isSub = a.isSubmitted || submitState[a.assignmentId] === "submitted";
    if (activeTab === "pending") return !isSub;
    if (activeTab === "completed") return isSub;
    return true;
  });

  /* ─ render ─ */
  return (
    <div className="as-wrapper">

      {/* ── HEADER ── */}
      <div className="as-header">
        <div>
          <h1 className="as-title">📋 Assignments</h1>
          <p className="as-subtitle">Track and submit your assignments</p>
        </div>
        <div className="as-meta-row">
          <span className="as-meta-chip as-meta-chip--indigo">📌 {pending} pending</span>
          <span className="as-meta-chip as-meta-chip--emerald">✅ {submitted} submitted</span>
          {overdue > 0 && (
            <span className="as-meta-chip as-meta-chip--rose">⚠ {overdue} overdue</span>
          )}
        </div>
      </div>

      {/* ── ERROR & SUCCESS MESSAGES ── */}
      {error && (
        <div className="as-alert">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="as-alert" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#d1fae5" }}>
          <span>✅</span> {success}
        </div>
      )}

      {/* ── TABS ── */}
      <div className="as-tabs">
        <button
          className={`as-tab ${activeTab === "pending" ? "as-tab--active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({pending})
        </button>
        <button
          className={`as-tab ${activeTab === "completed" ? "as-tab--active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({submitted})
        </button>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="as-loading">
          <div className="as-spinner" />
          <span>Loading assignments…</span>
        </div>
      ) : visibleAssignments.length === 0 ? (
        <div className="as-empty">
          <span className="as-empty-icon">{activeTab === "completed" ? "🎉" : "📭"}</span>
          <p>{activeTab === "completed" ? "No completed assignments yet." : "No pending assignments!"}</p>
          <span>{activeTab === "completed" ? "Submit an assignment to see it here." : "You're all caught up."}</span>
        </div>
      ) : (
        <div className="as-list">
          {visibleAssignments.map(a => {
            const state = submitState[a.assignmentId] || "idle";
            const submitted_ = state === "submitted" || a.isSubmitted;
            const overdue_ = isOverdue(a.dueDate) && !submitted_;
            const currentFile = selectedFiles[a.assignmentId];

            return (
              <div
                key={a.assignmentId}
                className={`as-card
                  ${overdue_ ? "as-card--overdue" : ""}
                  ${submitted_ ? "as-card--submitted" : ""}
                `}
              >
                {/* left accent */}
                <div className="as-card-accent" />

                <div className="as-card-body">
                  {/* title row */}
                  <div className="as-card-top">
                    <div className="as-card-title-row">
                      <span className="as-card-icon">{submitted_ ? "✅" : overdue_ ? "⚠️" : "📝"}</span>
                      <h3 className="as-card-title">{a.title}</h3>
                    </div>
                    {/* status badge */}
                    {submitted_ ? (
                      <span className="as-badge as-badge--submitted">Completed</span>
                    ) : overdue_ ? (
                      <span className="as-badge as-badge--overdue">Expired / Overdue</span>
                    ) : (
                      <span className="as-badge as-badge--pending">Pending</span>
                    )}
                  </div>

                  {/* description (question) */}
                  {a.description && (
                    <div className="as-card-question">
                      <span className="as-question-label">Question / Instructions:</span>
                      <p className="as-card-desc">{a.description}</p>
                    </div>
                  )}

                  {/* SUBMISSION ROW (File + Submit Button) */}
                  <div className="as-card-action-row">
                    <div className="as-due-info">
                      <span className="as-due-label">Due: </span>
                      <span className={`as-due-val ${overdue_ ? "as-due-val--overdue" : ""}`}>
                        {fmt(a.dueDate)}
                      </span>
                    </div>

                    {!submitted_ && !overdue_ && (
                      <div className="as-upload-zone">
                        <div className="as-upload-header">
                          <span className="as-upload-icon">📤</span>
                          <div>
                            <p className="as-upload-title">Upload Your Answer</p>
                            <p className="as-upload-hint">Select a file (PDF, DOCX, ZIP, etc.) then click Submit</p>
                          </div>
                        </div>

                        <div className="as-upload-controls">
                          <label htmlFor={`file-${a.assignmentId}`} className={`as-file-label ${currentFile ? "as-file-label--selected" : ""}`}>
                            {currentFile ? `📎 ${currentFile.name}` : "📁 Choose File to Upload"}
                            <input
                              type="file"
                              id={`file-${a.assignmentId}`}
                              className="as-file-input"
                              onChange={(e) => handleFileChange(a.assignmentId, e.target.files[0])}
                              disabled={state === "submitting"}
                            />
                          </label>

                          <button
                            id={`submit-btn-${a.assignmentId}`}
                            className={`as-btn-submit
                              ${state === "submitting" ? "as-btn-submit--loading" : ""}
                              ${state === "error" ? "as-btn-submit--error" : ""}
                            `}
                            onClick={() => handleSubmit(a.assignmentId)}
                            disabled={state === "submitting" || !currentFile}
                          >
                            {state === "submitting" && <span className="as-btn-spinner" />}
                            {state === "error" ? "❌ Failed – Retry" : state === "submitting" ? "Uploading…" : "✅ Submit Assignment"}
                          </button>
                        </div>
                      </div>
                    )}

                    {!submitted_ && overdue_ && (
                      <div className="as-overdue-notice">
                        ⚠️ This assignment's deadline has passed. Submission is no longer allowed.
                      </div>
                    )}

                    {submitted_ && (
                      <span className="as-submitted-label">
                        ✔ Assignment Submitted Successfully
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}