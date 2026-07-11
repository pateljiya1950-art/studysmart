import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { PerformanceModal, AssignTaskModal, GiveFeedbackModal } from "./MentorGuidanceModals";

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const [activeModal, setActiveModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = () => {
    setLoading(true);
    authFetch("/mentor/students")
      .then(setStudents)
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openModal = (type, student) => {
    setSelectedStudent(student);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedStudent(null);
  };

  const handleSuccess = () => {
    closeModal();
    fetchStudents(); // Refresh data if needed, e.g., task counts might update
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active": return <span className="badge badge-green">Active</span>;
      case "Needs Improvement": return <span className="badge badge-amber">Needs Improvement</span>;
      case "Inactive": return <span className="badge badge-red">Inactive</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>🎓 Assigned Students & Guidance</h1>
          <p>Monitor performance and assign tasks to your mentees.</p>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: 13, padding: "6px 14px" }}>
          {students.length} Students
        </span>
      </div>

      <div style={{ marginTop: 24 }}>
        {error   && <div className="alert alert-error">⚠️ {error}</div>}

        {loading ? (
          <div className="md-spinner"><div className="spinner-ring" /> Loading students…</div>
        ) : students.length === 0 ? (
          <div className="md-card">
            <div className="empty-state">
              <span className="empty-state-icon">🎓</span>
              <p>No students assigned yet.</p>
            </div>
          </div>
        ) : (
          <div className="md-card" style={{ padding: 0 }}>
            <div className="md-table-wrap">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Productivity</th>
                    <th>Tasks (Done/Total)</th>
                    <th>Skills Requested</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.studentId}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="feedback-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                            {initials(s.name)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{s.course || "—"}</td>
                      <td style={{ fontWeight: "bold", color: s.productivityScore < 50 ? "#e74c3c" : "#2ecc71" }}>
                        {s.productivityScore}%
                      </td>
                      <td>
                        {s.completedTasks} / {(s.completedTasks || 0) + (s.pendingTasks || 0)}
                      </td>
                      <td style={{ maxWidth: 150 }}>
                        {s.skills && s.skills.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {s.skills.map((sk, idx) => (
                              <span key={idx} style={{ 
                                background: "rgba(37, 99, 235, 0.15)", color: "var(--accent)", 
                                border: "1px solid rgba(37, 99, 235, 0.3)",
                                padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 600
                              }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : "—"}
                      </td>
                      <td>
                        {getStatusBadge(s.status)}
                      </td>
                      <td style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button className="btn btn-sm" onClick={() => openModal("PERFORMANCE", s)}>📊 View</button>
                        <button className="btn btn-sm" onClick={() => openModal("TASK", s)}>📝 Task</button>
                        <button className="btn btn-sm" onClick={() => openModal("FEEDBACK", s)}>💬 Feedback</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {activeModal === "PERFORMANCE" && selectedStudent && (
        <PerformanceModal student={selectedStudent} onClose={closeModal} />
      )}
      {activeModal === "TASK" && selectedStudent && (
        <AssignTaskModal student={selectedStudent} onClose={closeModal} onSuccess={handleSuccess} />
      )}
      {activeModal === "FEEDBACK" && selectedStudent && (
        <GiveFeedbackModal student={selectedStudent} onClose={closeModal} onSuccess={handleSuccess} />
      )}
    </div>
  );
}