import { authFetch } from "./authService";

/* ================= DASHBOARD ================= */
export async function getStudentDashboard() {
  return await authFetch("/student/dashboard");
}

/* ================= PROFILE ================= */
export async function getStudentProfile() {
  return await authFetch("/student/profile");
}

export async function saveStudentProfile(data) {
  return await authFetch("/student/profile", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

/* ================= ANALYTICS ================= */
export async function getWeeklyAnalytics() {
  return await authFetch("/student/analytics/weekly");
}

export async function getMonthlyAnalytics() {
  return await authFetch("/student/analytics/monthly");
}

/* ================= MENTOR DISCOVERY ================= */
export async function getMentorsBySkill(skillId) {
  return await authFetch(`/student/mentors/${skillId}`);
}

export async function sendMentorRequest(data) {
  return await authFetch("/student/mentor-requests", {
    method: "POST",
    body: JSON.stringify(data)
  });
}