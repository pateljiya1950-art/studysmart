import React, { useState, useEffect } from "react";
import {
  getStudentPerformance,
  assignMentorTask,
  giveMentorFeedback,
  getMentorFeedbackList
} from "../../services/mentorApi";

export function PerformanceModal({ student, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    Promise.all([
      getStudentPerformance(student.studentId),
      getMentorFeedbackList(student.studentId)
    ])
      .then(([perfData, fbData]) => {
        setData(perfData);
        setFeedbacks(fbData);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load performance data.");
      })
      .finally(() => setLoading(false));
  }, [student.studentId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 700 }}>
        <h2>📊 Performance: {student.name}</h2>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {loading ? (
          <div className="md-spinner"><div className="spinner-ring" /> Loading...</div>
        ) : data ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
              <div className="md-card" style={{ textAlign: "center", padding: "16px" }}>
                <h3>Productivity</h3>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: data.productivityScore < 50 ? "#e74c3c" : "#2ecc71" }}>
                  {data.productivityScore}%
                </div>
              </div>
              <div className="md-card" style={{ textAlign: "center", padding: "16px" }}>
                <h3>Completed Tasks</h3>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3498db" }}>
                  {data.completedTasks}
                </div>
              </div>
              <div className="md-card" style={{ textAlign: "center", padding: "16px" }}>
                <h3>Pending Tasks</h3>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>
                  {data.pendingTasks}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <h4>Recent Submissions</h4>
                {data.recentSubmissions?.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {data.recentSubmissions.map((sub, i) => (
                      <li key={i}>{sub.title} - {new Date(sub.submittedAt).toLocaleDateString()}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "gray" }}>No recent submissions.</p>
                )}
              </div>
              <div>
                <h4>Feedback History</h4>
                {feedbacks?.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {feedbacks.map((fb) => (
                      <li key={fb.feedbackId}>
                        <em>{new Date(fb.createdAt).toLocaleDateString()}</em>: {fb.feedback1}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "gray" }}>No feedback given yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="modal-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function AssignTaskModal({ student, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await assignMentorTask({ studentId: student.studentId, title, dueDate: dueDate || null });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 450 }}>
        <h2>📝 Assign Task to {student.name}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" className="form-control" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="modal-actions" style={{ marginTop: "24px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GiveFeedbackModal({ student, onClose, onSuccess }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await giveMentorFeedback({ studentId: student.studentId, feedbackText });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 450 }}>
        <h2>💬 Give Feedback to {student.name}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Feedback Message</label>
            <textarea
              className="form-control"
              rows="4"
              required
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
          </div>
          <div className="modal-actions" style={{ marginTop: "24px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
