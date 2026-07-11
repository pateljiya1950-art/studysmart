import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaSmile, FaMeh, FaFrown, FaPenNib, FaTasks, FaLightbulb, FaRegCalendarAlt, FaStar, FaHistory, FaTrash } from "react-icons/fa";
import "./Reflection.css";

export default function Reflection() {
  const [reflections, setReflections] = useState([]);
  const [mood, setMood] = useState("Good");
  const [challenges, setChallenges] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    try {
      const data = await authFetch("/student/reflection");
      setReflections(data || []);
    } catch(err) {
      console.error("Failed to load reflections", err);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async (e) => {
    e.preventDefault();
    if (!challenges.trim() || !improvementPlan.trim()) return;

    try {
      await authFetch("/student/reflection", {
        method: "POST",
        body: JSON.stringify({
          mood, // "Good", "Average", "Bad"
          challenges,
          improvementPlan
        })
      });

      // Clear form
      setMood("Good");
      setChallenges("");
      setImprovementPlan("");
      
      loadReflections();
    } catch(err) {
      console.error("Failed to add reflection", err);
    }
  };

  const deleteReflection = async (id) => {
    console.log("Deleting reflection with id:", id);
    try {
      // Optimistically remove from UI immediately
      setReflections(prev => prev.filter(r => r.reflectionId !== id));
      setConfirmDeleteId(null);

      await authFetch(`/student/reflection/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      // Re-sync from server to confirm
      loadReflections();
    } catch(err) {
      console.error("Failed to delete reflection:", err);
      // Restore on failure
      loadReflections();
    }
  };

  const getMoodConfig = (m) => {
    const s = (m || "Good").toLowerCase();
    if (s === "bad") return { icon: <FaFrown />, label: "Struggling", colorClass: "text-rose-box" };
    if (s === "average") return { icon: <FaMeh />, label: "Okay", colorClass: "text-amber-box" };
    return { icon: <FaSmile />, label: "Great", colorClass: "text-emerald-box" };
  };

  return (
    <>
    <div className="rf">
      
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="rf-header">
        <div>
          <h1 className="rf-title">Daily Reflection</h1>
          <p className="rf-subtitle">Track your emotional progress, log challenges, and plan your improvements.</p>
        </div>
      </div>

      <div className="rf-layout">

        {/* ── LOG NEW REFLECTION FORM ─────────────────────────────── */}
        <div className="rf-side">
          <div className="rf-card rf-form-card">
            <h3 className="rf-card-title">How was your study day?</h3>
            
            <form className="rf-form" onSubmit={addReflection}>
              
              {/* Mood Selector */}
              <div className="rf-input-group">
                <label>Select Mood</label>
                <div className="rf-mood-toggle">
                  <div 
                    className={`rf-mood-btn ${mood === "Good" ? "active-good" : ""}`}
                    onClick={() => setMood("Good")}
                  >
                    <FaSmile className="rf-mood-icon" /> Great
                  </div>
                  <div 
                    className={`rf-mood-btn ${mood === "Average" ? "active-avg" : ""}`}
                    onClick={() => setMood("Average")}
                  >
                    <FaMeh className="rf-mood-icon" /> Okay
                  </div>
                  <div 
                    className={`rf-mood-btn ${mood === "Bad" ? "active-bad" : ""}`}
                    onClick={() => setMood("Bad")}
                  >
                    <FaFrown className="rf-mood-icon" /> Bad
                  </div>
                </div>
              </div>

              {/* Challenges */}
              <div className="rf-input-group">
                <label>What challenges did you face today?</label>
                <div className="rf-textarea-wrap">
                  <FaTasks className="rf-input-icon text-indigo" />
                  <textarea
                    placeholder="E.g., I struggled to stay focused during react..."
                    value={challenges}
                    onChange={e => setChallenges(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Improvements */}
              <div className="rf-input-group">
                <label>How will you improve tomorrow?</label>
                <div className="rf-textarea-wrap">
                  <FaLightbulb className="rf-input-icon text-amber" />
                  <textarea
                    placeholder="E.g., I will try the Pomodoro technique..."
                    value={improvementPlan}
                    onChange={e => setImprovementPlan(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="rf-btn-submit">
                <FaPenNib /> Log Reflection
              </button>

            </form>
          </div>
          
          <div className="rf-info-box">
             <FaStar className="rf-info-icon" />
             <div>
               <h4>Why Reflect?</h4>
               <p>Self-reflection improves metacognition, helping you recognize bad habits early and cement better study tactics!</p>
             </div>
          </div>
        </div>

        {/* ── REFLECTION HISTORY ────────────────────────────────── */}
        <div className="rf-main">
          {loading ? (
             <div className="rf-empty">
               <div className="rf-spinner-large" />
               <p>Loading your journal...</p>
             </div>
          ) : reflections.length === 0 ? (
            <div className="rf-empty">
               <FaHistory className="rf-empty-icon" />
               <p>Your journal is empty.</p>
               <span>Log your first reflection on the left to start tracking your journey.</span>
            </div>
          ) : (
            <div className="rf-grid">
              {reflections.map(r => {
                const moodConfig = getMoodConfig(r.mood);
                
                return (
                  <div key={r.reflectionId} className="rf-item-card">
                    
                    <div className="rf-item-header">
                      <div className="rf-item-date">
                        <FaRegCalendarAlt /> {new Date(r.date || new Date()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={`rf-mood-badge ${moodConfig.colorClass}`}>
                          {moodConfig.icon} {moodConfig.label}
                        </div>
                        <button
                          className="rf-btn-delete"
                          onClick={() => setConfirmDeleteId(r.reflectionId)}
                          title="Delete reflection"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="rf-item-body">
                      <div className="rf-log-section">
                        <h5>Challenges</h5>
                        <p>{r.challenges || "None noted"}</p>
                      </div>
                      <div className="rf-log-section">
                        <h5>Improvement Plan</h5>
                        <p>{r.improvementPlan || "No plan noted"}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>

    {/* ── CUSTOM DELETE CONFIRM MODAL ────────────────────── */}
    {confirmDeleteId && (
      <div className="rf-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
        <div className="rf-modal" onClick={e => e.stopPropagation()}>
          <div className="rf-modal-icon">🗑️</div>
          <h3 className="rf-modal-title">Delete Reflection?</h3>
          <p className="rf-modal-desc">This entry will be permanently removed from your journal. This action cannot be undone.</p>
          <div className="rf-modal-actions">
            <button className="rf-modal-cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            <button className="rf-modal-confirm" onClick={() => deleteReflection(confirmDeleteId)}>Yes, Delete</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}