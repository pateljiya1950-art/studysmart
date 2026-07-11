import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMentorExams, createExam, assignExam } from "../../services/examApi";
import { fetchStudents } from "../../services/mentorStudentsApi";
import "./MentorExams.css";

export default function MentorExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showCreateWrapper, setShowCreateWrapper] = useState(false);
  const [showAssignWrapper, setShowAssignWrapper] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");

  // Create Form
  const [createForm, setCreateForm] = useState({ title: "", subject: "", examDate: "", duration: 60 });
  const [assignForm, setAssignForm] = useState({ studentId: "", dueDate: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const examsRes = await getMentorExams();
      if (examsRes.success) {
        setExams(examsRes.data);
      } else {
        setError(examsRes.message || "Failed to load exams");
      }
      const studentsRes = await fetchStudents();
      setStudents(studentsRes);
    } catch (err) {
      setError("An error occurred while loading data");
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createExam(createForm);
      if (res.success) {
        setShowCreateWrapper(false);
        setExams([res.data, ...exams]);
        setCreateForm({ title: "", subject: "", examDate: "", duration: 60 });
      } else {
        alert("Error: " + (res?.message || "Something went wrong"));
      }
    } catch (err) {
      console.error("[handleCreate] Error:", err);
      alert("Server error: " + (err?.message || "Something went wrong"));
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !assignForm.studentId || !assignForm.dueDate) {
      alert("Please fill all fields.");
      return;
    }
    const payload = {
      examId: Number(selectedExamId),
      studentId: Number(assignForm.studentId),
      dueDate: assignForm.dueDate
    };
    console.log("[handleAssign] Payload:", payload);
    try {
      const res = await assignExam(payload);
      console.log("[handleAssign] Response:", res);
      if (res.success) {
        alert("Exam assigned successfully!");
        setShowAssignWrapper(false);
        setAssignForm({ studentId: "", dueDate: "" });
      } else {
        alert("Error: " + (res?.message || "Something went wrong"));
      }
    } catch (err) {
      console.error("[handleAssign] Error:", err);
      alert("Server error: " + (err?.message || "Something went wrong"));
    }
  };

  return (
    <div className="me-container">
      <div className="me-header">
        <div className="me-titles">
          <h1>Exam Management</h1>
          <p>Create and assign knowledge assessments securely</p>
        </div>
        <div className="me-actions">
          <button className="btn-outline" onClick={() => navigate('/mentor/exam-analytics')} style={{ marginRight: 10 }}>
            🏆 View Student Results
          </button>
          <button className="btn-primary" onClick={() => navigate('/mentor/exam-create')}>
            + Create Advanced Exam (AI)
          </button>
        </div>
      </div>

      {error && <div className="me-error">{error}</div>}

      {loading ? (
        <div className="me-loading"><div className="me-spinner"></div></div>
      ) : (
        <div className="me-content">
          <div className="me-grid">
            {exams.length === 0 ? (
              <div className="me-empty">No exams created yet.</div>
            ) : (
              exams.map(exam => (
                <div key={exam.examId} className="me-card">
                  <div className="me-card-tag">{exam.subject}</div>
                  <h3>{exam.title}</h3>
                  <div className="me-card-metrics">
                    <span>📅 {exam.examDate}</span>
                    <span>⏱ {exam.duration} mins</span>
                  </div>
                  <button
                    className="btn-outline"
                    onClick={() => {
                      setSelectedExamId(exam.examId);
                      setShowAssignWrapper(true);
                    }}
                  >
                    Assign to Student
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateWrapper && (
        <div className="me-modal-overlay">
          <div className="me-modal">
            <h2>Create New Exam</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input required value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="e.g. Midterm Physics" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input required value={createForm.subject} onChange={e => setCreateForm({ ...createForm, subject: e.target.value })} placeholder="e.g. Physics" />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input required type="date" value={createForm.examDate} onChange={e => setCreateForm({ ...createForm, examDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Duration (mins)</label>
                <input required type="number" min="10" value={createForm.duration} onChange={e => setCreateForm({ ...createForm, duration: e.target.value })} />
              </div>
              <div className="me-modal-actions">
                <button type="button" className="btn-text" onClick={() => setShowCreateWrapper(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignWrapper && (
        <div className="me-modal-overlay">
          <div className="me-modal">
            <h2>Assign Exam</h2>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label>Student</label>
                <select required value={assignForm.studentId} onChange={e => setAssignForm({ ...assignForm, studentId: e.target.value })}>
                  <option value="">-- Select Student --</option>
                  {students.map(s => {
                    const id = s.studentId ?? s.StudentId ?? s._id;
                    const displayName = s.name ?? s.fullName ?? s.Name ?? "Unknown";
                    const email = s.email ?? s.Email ?? "";
                    return (
                      <option key={id} value={id}>{displayName}{email ? ` (${email})` : ""}</option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input required type="date" value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
              </div>
              <div className="me-modal-actions">
                <button type="button" className="btn-text" onClick={() => setShowAssignWrapper(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Assign Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
