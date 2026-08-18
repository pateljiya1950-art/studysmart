import { useEffect, useState } from "react";
import { getMentorAssignments, createMentorAssignment, getMentorAssignmentSubmissions, deleteMentorAssignment } from "../../services/examAssignmentApi";

// Base URL for file downloads (strips /api suffix to get the host)
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "https://localhost:7214";

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

const TODAY = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

/* ── component ── */
export default function MentorAssignments() {
  /* ─ list state ─ */
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  /* ─ submissions state ─ */
  const [expandedId, setExpandedId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  /* ─ form state ─ */
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [formSuccess, setFormSuccess] = useState("");

  /* ─ load ─ */
  useEffect(() => { loadAssignments(); }, []);

  async function loadAssignments() {
    setLoading(true);
    setListError("");
    try {
      const data = await getMentorAssignments();
      const sorted = [...(data || [])].sort(
        (a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate)
      );
      setAssignments(sorted);
    } catch (err) {
      setListError(err.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSubmissions(assignmentId) {
    if (expandedId === assignmentId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(assignmentId);
    setLoadingSubs(true);
    try {
      const data = await getMentorAssignmentSubmissions(assignmentId);
      setSubmissions(data || []);
    } catch (err) {
      console.error("Failed to load submissions", err);
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  }

  /* ─ delete ─ */
  async function handleDelete(assignmentId, title) {
    if (!window.confirm(`Delete "${title}"? This will also remove all student submissions.`))
      return;
    setDeletingId(assignmentId);
    try {
      await deleteMentorAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
      if (expandedId === assignmentId) setExpandedId(null);
    } catch (err) {
      alert(err.message || "Failed to delete assignment.");
    } finally {
      setDeletingId(null);
    }
  }

  /* ─ create ─ */
  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.title.trim()) {
      setFormError("Assignment title is required.");
      return;
    }
    if (!form.dueDate) {
      setFormError("Due date is required.");
      return;
    }

    setCreating(true);
    try {
      await createMentorAssignment({
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate
      });
      setFormSuccess("✅ Assignment created successfully!");
      setForm({ title: "", description: "", dueDate: "" });
      await loadAssignments();
      // auto-clear success after 4 s
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      setFormError(err.message || "Failed to create assignment.");
    } finally {
      setCreating(false);
    }
  }

  const overdue = assignments.filter(a => isOverdue(a.dueDate)).length;
  const active = assignments.length - overdue;

  return (
    <div className="animate-in" style={styles.wrapper}>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>📋 Manage Assignments</h1>
          <p style={styles.pageSubtitle}>Create and track assignments for your students</p>
        </div>
        <div style={styles.metaRow}>
          <span style={{ ...styles.chip, ...styles.chipIndigo }}>📌 {active} active</span>
          {overdue > 0 && (
            <span style={{ ...styles.chip, ...styles.chipRose }}>⚠ {overdue} overdue</span>
          )}
        </div>
      </div>

      {/* ═══════════════════ CREATE FORM ═══════════════════ */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>➕ Create New Assignment</h2>

        {formError && <div style={{ ...styles.alert, ...styles.alertError }}>{formError}</div>}
        {formSuccess && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{formSuccess}</div>}

        <form onSubmit={handleCreate} style={styles.form}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Title <span style={styles.req}>*</span></label>
            <input
              id="ma-title"
              style={styles.input}
              placeholder="e.g. Chapter 3 Summary"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
              disabled={creating}
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description <span style={styles.optional}></span></label>
            <textarea
              id="ma-desc"
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="Describe what the student should do…"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              disabled={creating}
            />
          </div>

          {/* Due Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Due Date <span style={styles.req}>*</span></label>
            <input
              id="ma-due"
              type="date"
              style={styles.input}
              value={form.dueDate}
              min={TODAY}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              required
              disabled={creating}
            />
          </div>

          <button
            id="ma-submit-btn"
            type="submit"
            style={{
              ...styles.btnCreate,
              ...(creating ? styles.btnCreateDisabled : {})
            }}
            disabled={creating}
          >
            {creating
              ? <><span style={styles.btnSpinner} /> Creating…</>
              : "📤 Create Assignment"
            }
          </button>
        </form>
      </div>

      {/* ═══════════════════ LIST ═══════════════════ */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📂 Created Assignments</h2>

        {listError && <div style={{ ...styles.alert, ...styles.alertError }}>{listError}</div>}

        {loading ? (
          <div style={styles.loadingRow}>
            <span style={styles.iconSpin}>⏳</span> Loading assignments…
          </div>
        ) : assignments.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📭</span>
            <p>No assignments created yet.</p>
            <span>Use the form above to create your first one.</span>
          </div>
        ) : (
          <div style={styles.list}>
            {assignments.map(a => {
              const overdue_ = isOverdue(a.dueDate);
              return (
                <div
                  key={a.assignmentId}
                  style={{
                    ...styles.listItem,
                    ...(overdue_ ? styles.listItemOverdue : {})
                  }}
                >
                  {/* accent bar */}
                  <div style={{
                    ...styles.accent,
                    background: overdue_ ? "#f43f5e" : "#6366f1"
                  }} />

                  <div style={styles.listItemBody}>
                    <div style={styles.listItemTop}>
                      <div style={styles.listItemTitle}>
                        <span>{overdue_ ? "⚠️" : "📝"}</span>
                        <strong>{a.title}</strong>
                      </div>
                      <span style={{
                        ...styles.badge,
                        ...(overdue_ ? styles.badgeOverdue : styles.badgeActive)
                      }}>
                        {overdue_ ? "Overdue" : "Active"}
                      </span>
                    </div>

                    {a.description && (
                      <p style={styles.listItemDesc}>{a.description}</p>
                    )}

                    <div style={styles.listItemFooter}>
                      <div style={styles.dueInfo}>
                        <span style={styles.dueLbl}>Due:</span>
                        <span style={{
                          ...styles.dueVal,
                          color: overdue_ ? "#f43f5e" : "#64748b"
                        }}>
                          {fmt(a.dueDate)}
                        </span>
                      </div>
                      <div style={styles.footerActions}>
                        <button
                          style={styles.btnViewSubs}
                          onClick={() => toggleSubmissions(a.assignmentId)}
                        >
                          {expandedId === a.assignmentId ? "Hide Submissions" : `View ${a.submissionCount || 0} Submissions`}
                        </button>
                        <button
                          style={{
                            ...styles.btnDelete,
                            ...(deletingId === a.assignmentId ? styles.btnDeleteDisabled : {})
                          }}
                          onClick={() => handleDelete(a.assignmentId, a.title)}
                          disabled={deletingId === a.assignmentId}
                          title="Delete assignment"
                        >
                          {deletingId === a.assignmentId ? "Deleting…" : "🗑 Delete"}
                        </button>
                      </div>
                    </div>

                    {expandedId === a.assignmentId && (
                      <div style={{ ...styles.subsContainer, animation: "as-fade-up 0.2s ease" }}>
                        {loadingSubs ? (
                          <span style={styles.subsLoading}>Loading submissions...</span>
                        ) : submissions.length === 0 ? (
                          <span style={styles.subsEmpty}>No submissions yet.</span>
                        ) : (
                          <ul style={styles.subsList}>
                            {submissions.map(sub => (
                              <li key={sub.submissionId} style={styles.subItem}>
                                <div style={styles.subLeft}>
                                  <strong>{sub.studentName}</strong>
                                  <span style={styles.subDate}>Submitted: {fmt(sub.submittedAt)}</span>
                                </div>
                                {sub.filePath ? (
                                  <a
                                    href={`${API_BASE}${sub.filePath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.btnDownload}
                                  >
                                    ⬇ Download File
                                  </a>
                                ) : (
                                  <span style={styles.noFile}>No File Attached</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ INLINE STYLES ═══════════════════
   (kept inline to avoid touching MentorLayout.css)
   ══════════════════════════════════════════════════════ */
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 820,
    margin: "0 auto",
    padding: "4px 0 48px",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif"
  },

  /* Header */
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" },
  pageSubtitle: { margin: "4px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 500 },
  metaRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  chip: { fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 },
  chipIndigo: { background: "#eef2ff", color: "#6366f1", border: "1px solid #e0e7ff" },
  chipRose: { background: "#fff1f2", color: "#f43f5e", border: "1px solid #ffe4e6" },

  /* Card */
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(79,70,229,.04)",
    display: "flex",
    flexDirection: "column",
    gap: 18
  },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" },

  /* Alert */
  alert: { borderRadius: 10, padding: "11px 15px", fontSize: 13, fontWeight: 500 },
  alertError: { background: "#fff1f2", color: "#f43f5e", border: "1px solid #ffe4e6" },
  alertSuccess: { background: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" },

  /* Form */
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  req: { color: "#f43f5e", marginLeft: 2 },
  optional: { color: "#94a3b8", fontWeight: 400 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
    background: "#fafbff"
  },
  textarea: { resize: "vertical", lineHeight: 1.6 },

  btnCreate: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 14px rgba(99,102,241,.35)"
  },
  btnCreateDisabled: { opacity: 0.6, cursor: "not-allowed" },
  btnSpinner: {
    display: "inline-block",
    width: 14, height: 14,
    border: "2px solid rgba(255,255,255,.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite"
  },

  /* Loading */
  loadingRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#64748b", padding: "20px 0" },
  iconSpin: { fontSize: 18 },

  /* Empty state */
  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 0", color: "#94a3b8", textAlign: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 4 },

  /* List */
  list: { display: "flex", flexDirection: "column", gap: 12 },
  listItem: {
    display: "flex",
    borderRadius: 12,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    background: "#fff",
    transition: "box-shadow 0.2s, transform 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)"
  },
  listItemOverdue: { borderColor: "#fecdd3", background: "#fff8f8" },
  accent: { width: 4, flexShrink: 0 },
  listItemBody: { flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 6 },
  listItemTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  listItemTitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1e293b", fontWeight: 600 },
  listItemDesc: { margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 },
  listItemFooter: { display: "flex", gap: 6, alignItems: "center", marginTop: 4 },
  dueLbl: { fontSize: 12, color: "#94a3b8", fontWeight: 600 },
  dueVal: { fontSize: 12, fontWeight: 600 },

  /* Badges */
  badge: { fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 },
  badgeActive: { background: "#eef2ff", color: "#6366f1", border: "1px solid #e0e7ff" },
  badgeOverdue: { background: "#fff1f2", color: "#f43f5e", border: "1px solid #ffe4e6" },

  /* Submissions */
  dueInfo: { display: "flex", gap: 6, alignItems: "center" },
  footerActions: { display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" },
  btnViewSubs: {
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    background: "#eef2ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px rgba(79,70,229,.05)"
  },
  btnDelete: {
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    background: "#fff1f2",
    color: "#f43f5e",
    border: "1px solid #ffe4e6",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px rgba(244,63,94,.05)"
  },
  btnDeleteDisabled: { opacity: 0.55, cursor: "not-allowed" },
  subsContainer: {
    marginTop: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  subsLoading: { fontSize: 13, color: "#64748b", fontStyle: "italic" },
  subsEmpty: { fontSize: 13, color: "#64748b" },
  subsList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  subItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0,0,0,.02)"
  },
  subLeft: { display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: "#1e293b" },
  subDate: { fontSize: 11, color: "#64748b", fontWeight: 500 },
  btnDownload: {
    padding: "6px 12px",
    background: "#10b981",
    color: "#fff",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    transition: "opacity 0.2s, transform 0.1s",
    boxShadow: "0 2px 4px rgba(16,185,129,.2)"
  },
  noFile: { fontSize: 11, color: "#94a3b8", fontWeight: 500, fontStyle: "italic", padding: "6px 0" }
};