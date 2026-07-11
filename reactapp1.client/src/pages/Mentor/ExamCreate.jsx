import React, { useState } from 'react';
import { createAdvancedExam, generateAIQuestions } from '../../services/advancedExamApi';
import { useNavigate } from 'react-router-dom';
import './ExamCreate.css';

const ExamCreate = () => {
    const navigate = useNavigate();
    const [examData, setExamData] = useState({
        title: "",
        subject: "",
        examDate: new Date().toISOString().split('T')[0],
        duration: 60,
        difficultyLevel: "Medium",
        questions: []
    });

    const [aiParams, setAiParams] = useState({
        subject: "",
        difficultyLevel: "Medium",
        numberOfQuestions: 5
    });
    
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        const res = await createAdvancedExam(examData);
        if (res?.examId) {
            alert("Exam Created Successfully (ID: " + res.examId + ")");
            navigate('/mentor/dashboard');
        } else {
            alert("Failed to create exam");
        }
    };

    const handleAIGenerate = async () => {
        if (!aiParams.subject) return alert("Please enter a subject for AI generation.");
        setIsGenerating(true);
        const generated = await generateAIQuestions(aiParams);
        if (generated && generated.length > 0) {
            setExamData(prev => ({
                ...prev,
                subject: aiParams.subject,
                difficultyLevel: aiParams.difficultyLevel,
                questions: [...prev.questions, ...generated]
            }));
            alert(`${generated.length} questions generated!`);
        } else {
            alert("Failed to generate questions");
        }
        setIsGenerating(false);
    };

    const handleQuestionAdd = () => {
        setExamData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                type: "MCQ", 
                difficultyLevel: "Medium", 
                questionText: "", 
                optionA: "", optionB: "", optionC: "", optionD: "", 
                correctAnswer: ""
            }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQs = [...examData.questions];
        newQs[index][field] = value;
        setExamData({...examData, questions: newQs});
    };

    const removeQuestion = (index) => {
        const newQs = [...examData.questions];
        newQs.splice(index, 1);
        setExamData({...examData, questions: newQs});
    };

    return (
        <div className="exam-create-container">
            <div className="exam-create-header">
                <h1>Create Advanced Exam</h1>
                <p>Use our AI generator to kickstart, or build from scratch.</p>
            </div>

            <div className="ai-generator-panel glass-panel">
                <h3><i className="ai-icon">✨</i> AI Question Generator</h3>
                <div className="ai-controls">
                    <input type="text" placeholder="Topic/Subject (e.g. ReactJS)" 
                        value={aiParams.subject} onChange={e => setAiParams({...aiParams, subject: e.target.value})} />
                    
                    <select value={aiParams.difficultyLevel} onChange={e => setAiParams({...aiParams, difficultyLevel: e.target.value})}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <input type="number" min="1" max="20" placeholder="Number of Qs"
                        value={aiParams.numberOfQuestions} onChange={e => setAiParams({...aiParams, numberOfQuestions: parseInt(e.target.value)})} />
                    
                    <button type="button" onClick={handleAIGenerate} disabled={isGenerating} className="btn-ai">
                        {isGenerating ? "Generating..." : "Generate with AI"}
                    </button>
                </div>
            </div>

            <form className="exam-form" onSubmit={handleCreateExam}>
                <div className="glass-panel form-section">
                    <h3>Exam Details</h3>
                    <div className="form-grid">
                        <input type="text" placeholder="Exam Title" required
                            value={examData.title} onChange={e => setExamData({...examData, title: e.target.value})} />
                        
                        <input type="text" placeholder="Subject" required
                            value={examData.subject} onChange={e => setExamData({...examData, subject: e.target.value})} />
                        
                        <input type="date" required
                            value={examData.examDate} onChange={e => setExamData({...examData, examDate: e.target.value})} />
                        
                        <input type="number" placeholder="Duration (mins)" required
                            value={examData.duration} onChange={e => setExamData({...examData, duration: parseInt(e.target.value)})} />
                        
                        <select value={examData.difficultyLevel} onChange={e => setExamData({...examData, difficultyLevel: e.target.value})}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="questions-section">
                    <h3>Questions ({examData.questions.length})</h3>
                    {examData.questions.map((q, idx) => (
                        <div key={idx} className="question-edit-card glass-panel">
                            <div className="q-header">
                                <h4>Question {idx + 1}</h4>
                                <button type="button" onClick={() => removeQuestion(idx)} className="btn-remove">✖</button>
                            </div>
                            
                            <div className="q-setup">
                                <select value={q.type} onChange={e => updateQuestion(idx, 'type', e.target.value)}>
                                    <option value="MCQ">Multiple Choice</option>
                                    <option value="Subjective">Subjective (AI Graded)</option>
                                </select>
                                <select value={q.difficultyLevel} onChange={e => updateQuestion(idx, 'difficultyLevel', e.target.value)}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            
                            <textarea placeholder="Question Text" required value={q.questionText} onChange={e => updateQuestion(idx, 'questionText', e.target.value)} />
                            
                            {q.type === 'MCQ' && (
                                <div className="mcq-edit-options">
                                    <input type="text" placeholder="Option A" required value={q.optionA || ''} onChange={e => updateQuestion(idx, 'optionA', e.target.value)} />
                                    <input type="text" placeholder="Option B" required value={q.optionB || ''} onChange={e => updateQuestion(idx, 'optionB', e.target.value)} />
                                    <input type="text" placeholder="Option C" required value={q.optionC || ''} onChange={e => updateQuestion(idx, 'optionC', e.target.value)} />
                                    <input type="text" placeholder="Option D" required value={q.optionD || ''} onChange={e => updateQuestion(idx, 'optionD', e.target.value)} />
                                </div>
                            )}

                            <input type="text" placeholder={q.type === 'MCQ' ? "Correct Option (e.g. Option A)" : "Keywords for AI Grading (Comma separated)"} 
                                required value={q.correctAnswer || ''} onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)} 
                                className="correct-answer-input" />
                        </div>
                    ))}
                    
                    <button type="button" onClick={handleQuestionAdd} className="btn-add-q">+ Add Manual Question</button>
                </div>

                <div className="form-footer">
                    <button type="submit" className="btn-save-exam">Save & Publish Exam</button>
                </div>
            </form>
        </div>
    );
};

export default ExamCreate;
