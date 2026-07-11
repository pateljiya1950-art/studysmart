import { useState, useEffect, useCallback } from "react";
import {
  getMentorProfile,
  saveMentorProfile,
  getAllSkills,
  getMentorSkills,
  addMentorSkill,
  addCustomMentorSkill,
  deleteMentorSkill,
  getMentorDashboard,
} from "../../services/mentorApi";
import "./MentorProfile.css";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Expert"];
const TABS = [
  { id: "about",  label: "About",  icon: "👤" },
  { id: "skills", label: "Skills", icon: "🛠️" },
];

const SKILL_MODES = {
  PREDEFINED: "predefined",
  CUSTOM:     "custom",
};

function profBadgeClass(level) {
  return {
    Expert:       "badge-expert",
    Intermediate: "badge-intermediate",
    Beginner:     "badge-beginner",
  }[level] ?? "badge-cyan";
}

function initials(name = "") {
  return (name || "M").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function completionPercent(fields) {
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return <p className="mp-section-label">{children}</p>;
}

function HeroStat({ icon, value, label, color }) {
  return (
    <div className="mp-hero-stat">
      <div className="mp-hero-stat-icon" style={{ color }}>{icon}</div>
      <div className="mp-hero-stat-value" style={{ color }}>{value}</div>
      <div className="mp-hero-stat-label">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export default function MentorProfile() {
  const [activeTab, setActiveTab] = useState("about");

  // ── Dashboard meta ──────────────────────────────────────
  const [dashData, setDashData] = useState(null);

  // ── Profile fields ──────────────────────────────────────
  const [department,    setDepartment]    = useState("");
  const [profileExp,    setProfileExp]    = useState("");
  const [maxStudents,   setMaxStudents]   = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [initialLoad,    setInitialLoad]    = useState(true);

  // ── Skills data ─────────────────────────────────────────
  const [allSkills,    setAllSkills]    = useState([]);
  const [mentorSkills, setMentorSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError,   setSkillsError]   = useState("");
  const [skillsSuccess, setSkillsSuccess] = useState("");

  // ── Skill mode toggle ───────────────────────────────────
  const [skillMode, setSkillMode] = useState(SKILL_MODES.PREDEFINED);

  // ── Predefined skill form ───────────────────────────────
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency,     setProficiency]     = useState("Beginner");
  const [skillExp,        setSkillExp]        = useState("");
  const [skillSearch,     setSkillSearch]     = useState("");
  const [addSkillLoading, setAddSkillLoading] = useState(false);

  // ── Custom skill form ───────────────────────────────────
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillType, setCustomSkillType] = useState("Skill");
  const [customProf,      setCustomProf]      = useState("Beginner");
  const [customExp,       setCustomExp]       = useState("");
  const [addCustomLoading, setAddCustomLoading] = useState(false);

  // ── Deleting skill ──────────────────────────────────────
  const [deletingSkillId, setDeletingSkillId] = useState(null);

  /* ── Data fetching ────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await getMentorProfile();
      if (data) {
        setDepartment(data.department     || "");
        setProfileExp(data.experienceYears ?? "");
        setMaxStudents(data.maxStudents   ?? "");
      }
    } catch {
      setProfileError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const fetchSkillsData = useCallback(async () => {
    try {
      setSkillsLoading(true);
      const [all, saved] = await Promise.all([getAllSkills(), getMentorSkills()]);
      setAllSkills(all || []);
      setMentorSkills(saved || []);
    } catch {
      setSkillsError("Failed to load skills.");
    } finally {
      setSkillsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchSkillsData();
    getMentorDashboard().then(setDashData).catch(() => {});
  }, [fetchProfile, fetchSkillsData]);

  // Auto-clear messages
  useEffect(() => {
    if (!profileSuccess) return;
    const t = setTimeout(() => setProfileSuccess(""), 3500);
    return () => clearTimeout(t);
  }, [profileSuccess]);

  useEffect(() => {
    if (!skillsSuccess) return;
    const t = setTimeout(() => setSkillsSuccess(""), 3500);
    return () => clearTimeout(t);
  }, [skillsSuccess]);

  /* ── Derived ──────────────────────────────────────────── */
  const mentorName = dashData?.profile?.name || "Mentor";
  const avgRating  = dashData?.avgRating      ?? null;
  const totalStud  = dashData?.totalStudents  ?? null;
  const upcoming   = dashData?.upcomingSessions ?? null;

  const completionFields = [department, profileExp, maxStudents];
  const completion = completionPercent(completionFields);

  // Filter out skills the mentor already has
  const savedSkillIds  = new Set(mentorSkills.map(s => s.skillId));
  const filteredSkills = allSkills.filter(
    sk => sk.skillName.toLowerCase().includes(skillSearch.toLowerCase())
        && !savedSkillIds.has(sk.skillId)
  );

  /* ── Profile handler ──────────────────────────────────── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    try {
      setProfileLoading(true);
      await saveMentorProfile({
        department,
        experienceYears: profileExp   ? Number(profileExp)  : null,
        maxStudents:     maxStudents  ? Number(maxStudents) : null,
      });
      setProfileSuccess("Profile updated successfully!");
    } catch {
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Add predefined skill ─────────────────────────────── */
  const handleAddPredefinedSkill = async () => {
    setSkillsError(""); setSkillsSuccess("");
    if (!selectedSkillId) { setSkillsError("Please select a skill."); return; }

    try {
      setAddSkillLoading(true);
      const res = await addMentorSkill({
        skillId:          Number(selectedSkillId),
        proficiencyLevel: proficiency,
        experienceYears:  skillExp ? Number(skillExp) : 0,
      });
      setMentorSkills(prev => [...prev, res.skill ?? res]);
      setSkillsSuccess("Skill added to your profile! ✅");
      setSelectedSkillId(""); setProficiency("Beginner"); setSkillExp(""); setSkillSearch("");
    } catch (err) {
      const msg = await extractErrorMessage(err);
      setSkillsError(msg);
    } finally {
      setAddSkillLoading(false);
    }
  };

  /* ── Add custom skill ─────────────────────────────────── */
  const handleAddCustomSkill = async () => {
    setSkillsError(""); setSkillsSuccess("");
    if (!customSkillName.trim()) { setSkillsError("Skill name is required."); return; }

    // Client-side duplicate name check (case-insensitive)
    const nameNorm = customSkillName.trim().toLowerCase();
    const nameConflict = mentorSkills.some(s => s.skillName.toLowerCase() === nameNorm)
                      || allSkills.some(s => s.skillName.toLowerCase() === nameNorm);
    if (nameConflict) {
      // If it exists in allSkills, suggest selecting from the list instead
      const inAll = allSkills.find(s => s.skillName.toLowerCase() === nameNorm);
      if (inAll) {
        setSkillsError(`"${inAll.skillName}" already exists in the list. Switch to Predefined and select it.`);
        return;
      }
      setSkillsError("You already have this skill on your profile.");
      return;
    }

    try {
      setAddCustomLoading(true);
      const res = await addCustomMentorSkill({
        skillName:        customSkillName.trim(),
        skillType:        customSkillType || "Skill",
        proficiencyLevel: customProf,
        experienceYears:  customExp ? Number(customExp) : 0,
      });
      // Also reflect in allSkills so it appears in the predefined list next time
      const newSkill = res.skill ?? res;
      setMentorSkills(prev => [...prev, newSkill]);
      setAllSkills(prev => [
        ...prev,
        { skillId: newSkill.skillId, skillName: newSkill.skillName, skillType: newSkill.skillType, isCustom: true },
      ]);
      setSkillsSuccess("Custom skill created and added! ✅");
      setCustomSkillName(""); setCustomSkillType("Skill"); setCustomProf("Beginner"); setCustomExp("");
    } catch (err) {
      const msg = await extractErrorMessage(err);
      setSkillsError(msg);
    } finally {
      setAddCustomLoading(false);
    }
  };

  /* ── Delete skill ─────────────────────────────────────── */
  const handleDeleteSkill = async (skillId, isCustom, skillName) => {
    const confirmMsg = isCustom
      ? `Remove "${skillName}" from your profile?\n\nThis is a custom skill — if no other mentor uses it, it will also be removed from the system.`
      : `Remove "${skillName}" from your profile?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingSkillId(skillId);
      setSkillsError("");
      await deleteMentorSkill(skillId);
      setMentorSkills(prev => prev.filter(s => s.skillId !== skillId));
      // If custom and orphaned it's gone from DB — remove from allSkills too
      if (isCustom) {
        setAllSkills(prev => prev.filter(s => s.skillId !== skillId));
      }
      setSkillsSuccess("Skill removed. ✅");
    } catch (err) {
      const msg = await extractErrorMessage(err);
      setSkillsError(msg);
    } finally {
      setDeletingSkillId(null);
    }
  };

  /* ── Helper: extract error message from response ─────── */
  async function extractErrorMessage(err) {
    // authFetch already throws a plain Error with the parsed message
    if (err instanceof Error) return err.message;
    // Fallback for raw Response objects
    if (err instanceof Response) {
      try {
        const json = await err.json();
        return json.message || "An error occurred.";
      } catch { return "An error occurred."; }
    }
    return String(err) || "An error occurred.";
  }

  /* ── Loading skeleton ────────────────────────────────── */
  if (initialLoad) {
    return (
      <div className="mp-wrapper animate-in">
        <div className="md-spinner"><div className="spinner-ring" /> Loading profile…</div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className="mp-wrapper animate-in">

      {/* ═══════════════════ HERO ════════════════════════════ */}
      <div className="mp-hero">
        <div className="mp-hero-bg" />
        <div className="mp-hero-body">
          <div className="mp-avatar-wrap">
            <div className="mp-avatar">{initials(mentorName)}</div>
            <div className="mp-avatar-ring" />
            <span className="mp-status-dot" title="Active" />
          </div>

          <div className="mp-hero-identity">
            <h1 className="mp-hero-name">{mentorName}</h1>
            <div className="mp-hero-meta">
              {department && <span className="badge badge-blue">🏛️ {department}</span>}
              {profileExp  && <span className="badge badge-cyan">⚡ {profileExp} yrs exp</span>}
              <span className="badge badge-green">✅ Active Mentor</span>
            </div>
          </div>

          <div className="mp-hero-stats">
            <HeroStat icon="🎓" value={totalStud ?? "—"} label="Students"   color="var(--accent)" />
            <HeroStat icon="📅" value={upcoming  ?? "—"} label="Sessions"   color="var(--accent-2)" />
            <HeroStat icon="⭐" value={avgRating != null ? Number(avgRating).toFixed(1) : "—"} label="Avg Rating" color="var(--warning)" />
            <HeroStat icon="🛠️" value={mentorSkills.length} label="Skills"  color="var(--success)" />
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mp-completion">
          <div className="mp-completion-header">
            <span className="mp-completion-label">Profile Completion</span>
            <span className="mp-completion-pct"
                  style={{ color: completion >= 80 ? "var(--success)" : completion >= 50 ? "var(--warning)" : "var(--danger)" }}>
              {completion}%
            </span>
          </div>
          <div className="mp-completion-bar">
            <div
              className="mp-completion-fill"
              style={{
                width: `${completion}%`,
                background: completion >= 80
                  ? "linear-gradient(90deg, var(--success), #059669)"
                  : completion >= 50
                  ? "linear-gradient(90deg, var(--warning), #d97706)"
                  : "linear-gradient(90deg, var(--danger), #dc2626)",
              }}
            />
          </div>
          {completion < 100 && (
            <p className="mp-completion-hint">
              {completion < 50  ? "🚀 Fill in your department and max students capacity to boost visibility."
             : completion < 80  ? "✨ Almost there — add your years of experience to complete your profile."
             : "🎯 Great profile!"}
            </p>
          )}
        </div>
      </div>

      {/* ═══════════════════ TAB BAR ═════════════════════════ */}
      <div className="mp-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mp-tab ${activeTab === tab.id ? "mp-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
            {tab.id === "skills" && mentorSkills.length > 0 && (
              <span className="mp-tab-count">{mentorSkills.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════ TAB: ABOUT ══════════════════════ */}
      {activeTab === "about" && (
        <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {profileError   && <div className="alert alert-error">⚠️ {profileError}</div>}
          {profileSuccess && <div className="alert alert-success">✅ {profileSuccess}</div>}

          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="md-card">
              <div className="md-card-title"><span className="icon">🏛️</span> Professional Information</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input className="form-input" type="text" value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience *</label>
                  <input className="form-input" type="number" min="0" value={profileExp}
                    onChange={e => setProfileExp(e.target.value)}
                    placeholder="e.g. 5" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Students Capacity *</label>
                  <input className="form-input" type="number" min="1" value={maxStudents}
                    onChange={e => setMaxStudents(e.target.value)}
                    placeholder="e.g. 10" required />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn btn-primary" type="submit" disabled={profileLoading}>
                {profileLoading ? "⏳ Saving…" : "💾 Save Profile"}
              </button>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Fields marked * are required</span>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════ TAB: SKILLS ═════════════════════ */}
      {activeTab === "skills" && (
        <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {skillsError   && <div className="alert alert-error">⚠️ {skillsError}</div>}
          {skillsSuccess && <div className="alert alert-success">{skillsSuccess}</div>}

          {/* ── Saved Skills ─────────────────────────────────── */}
          <div className="md-card">
            <div className="md-card-title">
              <span className="icon">✅</span> My Skills
              <span className="badge badge-blue" style={{ marginLeft: 8 }}>{mentorSkills.length}</span>
            </div>

            {skillsLoading && !mentorSkills.length ? (
              <div className="md-spinner"><div className="spinner-ring" /> Loading skills…</div>
            ) : mentorSkills.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🛠️</span>
                <p>No skills saved yet — add your first expertise below.</p>
              </div>
            ) : (
              <div className="mp-skill-grid">
                {mentorSkills.map(ms => (
                  <div key={ms.mentorSkillId ?? ms.skillId} className="mp-skill-card">
                    <div className="mp-skill-header">
                      <div className="mp-skill-dot" />
                      <span className="mp-skill-name">
                        {ms.skillName}
                        {ms.isCustom && (
                          <span
                            title="Custom skill you created"
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              padding: "1px 6px",
                              borderRadius: 99,
                              background: "rgba(37, 99, 235, 0.25)",
                              color: "#60a5fa",
                              fontWeight: 600,
                              letterSpacing: ".3px",
                            }}
                          >
                            CUSTOM
                          </span>
                        )}
                      </span>
                      <button
                        className="skill-chip-remove"
                        onClick={() => handleDeleteSkill(ms.skillId, ms.isCustom, ms.skillName)}
                        disabled={deletingSkillId === ms.skillId}
                        title="Remove"
                      >
                        {deletingSkillId === ms.skillId ? "…" : "✕"}
                      </button>
                    </div>
                    <div className="mp-skill-footer">
                      <span className={`badge ${profBadgeClass(ms.proficiencyLevel)}`}>
                        {ms.proficiencyLevel}
                      </span>
                      <span className="mp-skill-exp">
                        {ms.experienceYears} yr{ms.experienceYears !== 1 ? "s" : ""}
                      </span>
                      <div className="mp-prof-bar-wrap">
                        <div
                          className="mp-prof-bar-fill"
                          style={{
                            width: ms.proficiencyLevel === "Expert" ? "100%"
                                 : ms.proficiencyLevel === "Intermediate" ? "60%"
                                 : "30%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Mode Toggle ──────────────────────────────────── */}
          <div className="md-card">
            <div className="md-card-title"><span className="icon">➕</span> Add New Skill</div>

            {/* Toggle strip */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                id="btn-mode-predefined"
                className={`mp-prof-btn ${skillMode === SKILL_MODES.PREDEFINED ? "mp-prof-btn-active" : ""}`}
                onClick={() => { setSkillMode(SKILL_MODES.PREDEFINED); setSkillsError(""); setSkillsSuccess(""); }}
              >
                📋 Select from List
              </button>
              <button
                type="button"
                id="btn-mode-custom"
                className={`mp-prof-btn ${skillMode === SKILL_MODES.CUSTOM ? "mp-prof-btn-active" : ""}`}
                onClick={() => { setSkillMode(SKILL_MODES.CUSTOM); setSkillsError(""); setSkillsSuccess(""); }}
              >
                ✏️ Add Custom Skill
              </button>
            </div>

            {/* ── PREDEFINED MODE ───────────────────────────── */}
            {skillMode === SKILL_MODES.PREDEFINED && (
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Search &amp; Select Skill</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="🔍 Type to filter skills…"
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <select
                    className="form-select"
                    value={selectedSkillId}
                    onChange={e => setSelectedSkillId(e.target.value)}
                    id="select-predefined-skill"
                  >
                    <option value="">— Choose a skill —</option>
                    {filteredSkills.map(skill => (
                      <option key={skill.skillId} value={skill.skillId}>
                        {skill.skillName}
                        {skill.isCustom ? " 🔖 (custom)" : ""}
                        {skill.skillType ? ` · ${skill.skillType}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Proficiency Level</label>
                  <div className="mp-prof-toggle">
                    {PROFICIENCY_LEVELS.map(l => (
                      <button key={l} type="button"
                        className={`mp-prof-btn ${proficiency === l ? "mp-prof-btn-active" : ""}`}
                        onClick={() => setProficiency(l)}
                      >
                        {l === "Beginner" ? "🌱" : l === "Intermediate" ? "⚡" : "🔥"} {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience with this skill (Years)</label>
                  <input className="form-input" type="number" min="0" max="50"
                    placeholder="Optional"
                    value={skillExp}
                    onChange={e => setSkillExp(e.target.value)} />
                </div>

                <div style={{ gridColumn: "span 2", marginTop: 4 }}>
                  <button
                    id="btn-add-predefined-skill"
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAddPredefinedSkill}
                    disabled={addSkillLoading || !selectedSkillId}
                  >
                    {addSkillLoading ? "⏳ Adding…" : "➕ Add Skill to Profile"}
                  </button>
                </div>
              </div>
            )}

            {/* ── CUSTOM MODE ───────────────────────────────── */}
            {skillMode === SKILL_MODES.CUSTOM && (
              <div className="form-grid">
                {/* info banner */}
                <div style={{
                  gridColumn: "span 2",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(37, 99, 235, 0.1)",
                  border: "1px solid rgba(37, 99, 235, 0.25)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}>
                  🔖 <strong style={{ color: "#2563eb" }}>Custom skills</strong> are saved to the
                  global skill list and tagged as custom. If no other mentor uses them and you remove
                  them, they are automatically cleaned up.
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Skill Name *</label>
                  <input
                    id="input-custom-skill-name"
                    className="form-input"
                    type="text"
                    placeholder="e.g. Quantum Computing, Prompt Engineering…"
                    value={customSkillName}
                    onChange={e => setCustomSkillName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skill Category</label>
                  <select
                    className="form-select"
                    value={customSkillType}
                    onChange={e => setCustomSkillType(e.target.value)}
                  >
                    <option value="Skill">Skill</option>
                    <option value="Subject">Subject</option>
                    <option value="Tool">Tool</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input className="form-input" type="number" min="0" max="50"
                    placeholder="Optional"
                    value={customExp}
                    onChange={e => setCustomExp(e.target.value)} />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Proficiency Level</label>
                  <div className="mp-prof-toggle">
                    {PROFICIENCY_LEVELS.map(l => (
                      <button key={l} type="button"
                        className={`mp-prof-btn ${customProf === l ? "mp-prof-btn-active" : ""}`}
                        onClick={() => setCustomProf(l)}
                      >
                        {l === "Beginner" ? "🌱" : l === "Intermediate" ? "⚡" : "🔥"} {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2", marginTop: 4 }}>
                  <button
                    id="btn-add-custom-skill"
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={addCustomLoading || !customSkillName.trim()}
                    style={{ background: "linear-gradient(135deg, var(--accent), #1d4ed8)" }}
                  >
                    {addCustomLoading ? "⏳ Creating…" : "✏️ Create & Add Custom Skill"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
