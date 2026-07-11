import React, { useEffect, useState } from 'react';
import { getStudentExamResults } from '../../services/advancedExamApi';
import './ExamResultView.css';

const ExamResultView = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const data = await getStudentExamResults();
            setResults(data || []);
            setLoading(false);
        };
        fetchResults();
    }, []);

    if (loading) return <div className="loading-screen">Loading Results...</div>;

    return (
        <div className="results-container">
            <header className="results-header glass-panel">
                <h1>Your Academic Performance</h1>
                <p>AI Evaluated Scores & Insights</p>
            </header>

            {results.length === 0 ? (
                <div className="glass-panel no-results">
                    <p>No exam results found.</p>
                </div>
            ) : (
                <div className="results-grid">
                    {results.map((res) => (
                        <div key={res.submissionId} className="result-card glass-panel">
                            <h3>{res.examTitle}</h3>
                            <div className="score-ring">
                                <svg viewBox="0 0 36 36" className="circular-chart blue">
                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                    <path className="circle" strokeDasharray={`${(res.score || 0) * 10}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                    <text x="18" y="20.35" className="percentage">{res.score}</text>
                                </svg>
                            </div>
                            <div className="result-details">
                                <p><strong>Total Score:</strong> {res.score}</p>
                                <p><strong>AI Subjective Score:</strong> {res.aiScore}</p>
                                <p className={`violation-status ${res.cheatingViolations > 0 ? 'red' : 'green'}`}>
                                    <strong>Violations:</strong> {res.cheatingViolations}
                                </p>
                                <p><strong>Submitted:</strong> {new Date(res.submittedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamResultView;
