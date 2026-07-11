import { authFetch } from "./authService";

/* ================= DASHBOARD ================= */
export async function getMentorDashboard() {
  return await authFetch("/mentor/dashboard");
}

/* ================= PROFILE ================= */
export async function getMentorProfile() {
  return await authFetch("/mentor/profile");
}

export async function saveMentorProfile(data) {
  await authFetch("/mentor/profile", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

/* ================= SKILLS ================= */
export async function getAllSkills() {
  return await authFetch("/skills");
}

export async function getMentorSkills() {
  return await authFetch("/mentor/skills");
}

/**
 * Map an existing predefined skill to the mentor's profile.
 * POST /mentor/add-skill
 */
export async function addMentorSkill(dto) {
  return await authFetch("/mentor/add-skill", {
    method: "POST",
    body: JSON.stringify(dto) // { skillId, proficiencyLevel, experienceYears }
  });
}

/**
 * Create a brand-new custom skill, then map it to the mentor's profile.
 * POST /mentor/add-custom-skill
 */
export async function addCustomMentorSkill(dto) {
  return await authFetch("/mentor/add-custom-skill", {
    method: "POST",
    body: JSON.stringify(dto) // { skillName, skillType?, proficiencyLevel, experienceYears }
  });
}

/**
 * Remove a skill from the mentor's profile (and purge orphan custom skills).
 * DELETE /mentor/delete-skill
 */
export async function deleteMentorSkill(skillId) {
  return await authFetch("/mentor/delete-skill", {
    method: "DELETE",
    body: JSON.stringify({ skillId })
  });
}

// ── Legacy wrappers kept for other callers ───────────────────────────────────
export async function addMentorSkills(skills) {
  await authFetch("/mentor/skills", {
    method: "POST",
    body: JSON.stringify(skills)
  });
}

export async function removeMentorSkill(skillId) {
  await authFetch(`/mentor/skills/${skillId}`, { method: "DELETE" });
}


/* ================= REQUESTS ================= */
export async function getMentorRequests() {
  return await authFetch("/mentor/requests");
}

export async function respondToRequest(requestId, action) {
  await authFetch("/mentor/requests/action", {
    method: "POST",
    body: JSON.stringify({ requestId, action })
  });
}

/* ================= AVAILABILITY ================= */
export async function getMentorAvailability() {
  return await authFetch("/mentor/availability");
}

export async function addMentorAvailability(data) {
  await authFetch("/mentor/availability", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function deleteMentorAvailability(id) {
  await authFetch(`/mentor/availability/${id}`, {
    method: "DELETE"
  });
}

/* ================= STUDENTS ================= */
export async function getMentorStudents() {
  return await authFetch("/mentor/students");
}

/* ================= SESSIONS ================= */
export async function getMentorSessions() {
  return await authFetch("/mentor/sessions");
}

export async function scheduleMentorSession(data) {
  await authFetch("/mentor/sessions", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateMentorSessionStatus(id, status) {
  await authFetch(`/mentor/sessions/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}

/* ================= GUIDANCE & FEEDBACK ================= */
export async function getStudentPerformance(studentId) {
  return await authFetch(`/mentor/student/${studentId}/performance`);
}

export async function assignMentorTask(data) {
  return await authFetch("/mentor/task", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function createMentorAssignment(data) {
  return await authFetch("/mentor/assignment", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function giveMentorFeedback(data) {
  return await authFetch("/mentor/feedback", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function getMentorFeedbackList(studentId) {
  return await authFetch(`/mentor/feedback/${studentId}`);
}