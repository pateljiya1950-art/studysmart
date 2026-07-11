import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdvancedExam, submitAdvancedExam } from '../../services/advancedExamApi';
import './ExamAttempt.css';

const ExamAttempt = () => {
    const { examId, assignmentId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [violations, setViolations] = useState(0);
    const [warningMsg, setWarningMsg] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchExam = async () => {
            const data = await getAdvancedExam(examId);
            if (data) {
                setExam(data);
                // Initialize timer from duration (assuming duration is in minutes)
                setTimeLeft(data.duration * 60);
            }
        };
        fetchExam();
    }, [examId]);

    const handleSubmit = useCallback(async (autoSubmit = false, vCount = violations) => {
        if (isSubmitted) return;
        setIsSubmitted(true);

        const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: parseInt(qId),
            selectedOption: ans.selectedOption || "",
            descriptiveAnswer: ans.descriptiveAnswer || ""
        }));

        const result = await submitAdvancedExam({
            examId: parseInt(examId),
            assignmentId: parseInt(assignmentId),
            cheatingViolations: vCount,
            answers: formattedAnswers
        });

        alert(autoSubmit ? "Exam automatically submitted." : "Exam submitted successfully.");
        navigate('/student/dashboard'); // Redirect to dashboard
    }, [answers, assignmentId, examId, isSubmitted, navigate, violations]);

    // Timer logic
    useEffect(() => {
        if (!exam || isSubmitted || timeLeft <= 0) {
            if (timeLeft === 0 && exam && !isSubmitted) {
                handleSubmit(true);
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [exam, isSubmitted, timeLeft, handleSubmit]);


    // Anti-Cheating logic
    useEffect(() => {
        if (isSubmitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation("Tab switched or minimized");
            }
        };

        const handleBlur = () => {
            handleViolation("Window lost focus");
        };

        const handleContext = (e) => e.preventDefault(); // Disable right click
        
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("contextmenu", handleContext);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("contextmenu", handleContext);
        };
    }, [isSubmitted, violations]);

    const handleViolation = (reason) => {
        if (isSubmitted) return;
        
        const newViolations = violations + 1;
        setViolations(newViolations);
        setWarningMsg(`Warning ${newViolations}/3: ${reason}. Do not leave the exam window!`);
        
        // Hide warning after 5s
        setTimeout(() => setWarningMsg(""), 5000);

        if (newViolations >= 3) {
            handleSubmit(true, newViolations);
        }
    };

    const handleAnswerChange = (qId, type, val) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                [type === "MCQ" ? "selectedOption" : "descriptiveAnswer"]: val
            }
        }));
    };

    const requestFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        }
    };

    if (!exam) return <div className="loading-screen">Loading Exam Data...</div>;

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="exam-attempt-container">
            {!isFullscreen && (
                <div className="fullscreen-overlay">
                    <div className="fullscreen-modal">
                        <h2>Welcome to the Advanced Exam</h2>
                        <p>This exam is strictly monitored. Tab switching or clicking outside the window is prohibited.</p>
                        <button onClick={requestFullscreen} className="btn-primary">Enter Fullscreen to Start</button>
                    </div>
                </div>
            )}
            
            {warningMsg && (
                <div className="warning-toast">
                    {warningMsg}
                </div>
            )}

            <div className={`exam-content ${!isFullscreen ? 'blurred' : ''}`}>
                <header className="exam-header glass-panel">
                    <div className="exam-title">
                        <h1>{exam.title}</h1>
                        <span className="exam-subject">{exam.subject}</span>
                    </div>
                    <div className={`exam-timer ${timeLeft < 60 ? 'danger-time' : ''}`}>
                        Time Left: <strong>{formatTime(timeLeft)}</strong>
                    </div>
                </header>

                <div className="questions-list">
                    {exam.questions && exam.questions.map((q, idx) => (
                        <div key={q.questionId} className="question-card glass-panel" onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
                            <h3><span>Q{idx + 1}.</span> {q.questionText}</h3>
                            <span className="question-badge">{q.type}</span>
                            
                            {q.type === "MCQ" ? (
                                <div className="mcq-options">
                                    {['optionA', 'optionB', 'optionC', 'optionD'].map(optKey => q[optKey] && (
                                        <label key={optKey} className={`mcq-option ${answers[q.questionId]?.selectedOption === q[optKey] ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name={`q-${q.questionId}`} 
                                                value={q[optKey]}
                                                onChange={() => handleAnswerChange(q.questionId, q.type, q[optKey])}
                                            />
                                            {q[optKey]}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="subjective-input">
                                    <textarea 
                                        placeholder="Type your descriptive answer here... (Copy-Paste Disabled)"
                                        value={answers[q.questionId]?.descriptiveAnswer || ""}
                                        onChange={(e) => handleAnswerChange(q.questionId, q.type, e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="exam-footer">
                    <button onClick={() => handleSubmit(false)} className="btn-submit">Submit Exam</button>
                    <p className="violation-text">Violations: {violations}/3</p>
                </div>
            </div>
        </div>
    );
};

export default ExamAttempt;
