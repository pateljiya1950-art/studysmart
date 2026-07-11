import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentExams } from "../../services/examApi";
import { getStudentExamResults } from "../../services/advancedExamApi";
import "./Exams.css";

export default function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const [examsRes, resultsData] = await Promise.all([
        getStudentExams(),
        getStudentExamResults()
      ]);
      if (Array.isArray(examsRes)) {
        setExams(examsRes);
      } else if (examsRes && examsRes.success) {
        setExams(examsRes.data);
      } else {
        setError(examsRes?.message || "Failed to load exams");
      }
      setResults(Array.isArray(resultsData) ? resultsData : []);
    } catch (err) {
      setError("An error occurred");
    }
    setLoading(false);
  };

  const getResultForExam = (examTitle) =>
    results.find(r => r.examTitle === examTitle);

  return (
    <div className="se-container">
      <div className="se-header">
        <h1>My Exams</h1>
        <p>View your upcoming exams and track your scores</p>
      </div>

      {error && <div className="se-error">{error}</div>}

      {loading ? (
        <div className="se-loading"><div className="se-spinner"></div></div>
      ) : (
        <div className="se-grid">
          {exams.length === 0 ? (
            <div className="se-empty">No exams assigned to you yet.</div>
          ) : (
            exams.map(assignment => {
              const result = getResultForExam(assignment.exam?.title);
              return (
                <div key={assignment.assignmentId} className={`se-card ${assignment.status === 'Completed' ? 'completed' : ''}`}>
                  <div className="se-card-header">
                    <span className="se-tag">{assignment.exam.subject}</span>
                    <span className={`se-status ${assignment.status.toLowerCase()}`}>{assignment.status}</span>
                  </div>
                  <h3>{assignment.exam.title}</h3>
                  <div className="se-info">
                    <p><strong>Exam Date:</strong> {assignment.exam.examDate}</p>
                    <p><strong>Due By:</strong> {assignment.dueDate}</p>
                    <p><strong>Duration:</strong> {assignment.exam.duration} mins</p>
                  </div>

                  {/* Score box shown after submission */}
                  {result && (
                    <div className="se-score-box">
                      <div className="se-score-item">
                        <span>🎯 Total Score</span>
                        <strong>{result.score ?? 0}</strong>
                      </div>
                      <div className="se-score-item">
                        <span>🤖 AI Score</span>
                        <strong>{result.aiScore ?? 0}</strong>
                      </div>
                      {result.cheatingViolations > 0 && (
                        <div className="se-score-item danger">
                          <span>⚠️ Violations</span>
                          <strong>{result.cheatingViolations}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {assignment.status !== 'Completed' && (
                    <button
                      className="btn-take-exam"
                      onClick={() => navigate(`/student/exam-attempt/${assignment.assignmentId}/${assignment.examId || assignment.exam?.examId}`)}
                    >
                      Take Exam
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}