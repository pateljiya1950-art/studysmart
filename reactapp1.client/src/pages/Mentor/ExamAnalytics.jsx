import React, { useEffect, useState } from 'react';
import { getMentorExamResults } from '../../services/advancedExamApi';
import './ExamAnalytics.css';

const ExamAnalytics = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const data = await getMentorExamResults();
            setResults(Array.isArray(data) ? data : []);
            setLoading(false);
        };
        fetchResults();
    }, []);

    if (loading) return <div className="loading-screen">Loading Student Results...</div>;

    return (
        <div className="analytics-container">
            <header className="analytics-header glass-panel">
                <h1>Student Exam Results</h1>
                <p>View scores, AI evaluations, and integrity violations for all submitted exams</p>
            </header>

            {results.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
                    <p>No exam submissions yet. Assign exams to students to see results here.</p>
                </div>
            ) : (
                <div className="analytics-grid">
                    {results.map((res) => (
                        <div key={res.submissionId} className="analytics-card glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0 }}>{res.examTitle}</h3>
                                <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.8rem' }}>
                                    {res.examSubject}
                                </span>
                            </div>

                            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', opacity: 0.7 }}>
                                👤 <strong>{res.studentName}</strong> &nbsp;•&nbsp; 🕐 {new Date(res.submittedAt).toLocaleDateString()}
                            </p>

                            <div className="stat-boxes">
                                <div className="stat-box">
                                    <span className="stat-label">🎯 Total Score</span>
                                    <span className="stat-value">{res.score ?? 0}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">🤖 AI Score</span>
                                    <span className="stat-value">{res.aiScore ?? 0}</span>
                                </div>
                            </div>

                            <div className="integrity-box">
                                <span className="stat-label">🚨 Cheating Violations</span>
                                <span className={`stat-value ${res.cheatingViolations > 0 ? 'danger' : 'warning'}`}>
                                    {res.cheatingViolations ?? 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamAnalytics;
