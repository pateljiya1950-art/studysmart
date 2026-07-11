import { authFetch } from "./authService";

/* ================= STUDENT – EXAMS ================= */
export async function getStudentExams() {
  return await authFetch("/student/exams");
}

/* ================= STUDENT – ASSIGNMENTS ================= */
export async function getStudentAssignments() {
  return await authFetch("/student/assignments");
}

export async function submitStudentAssignment(id, file) {
  const formData = new FormData();
  if (file) formData.append("file", file);

  return await authFetch(`/student/assignments/${id}/submit`, {
    method: "POST",
    body: formData
  });
}

/* ================= MENTOR – ASSIGNMENTS ================= */
export async function getMentorAssignments() {
  return await authFetch("/mentor/assignments");
}

export async function createMentorAssignment(data) {
  return await authFetch("/mentor/assignments", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function getMentorAssignmentSubmissions(assignmentId) {
  return await authFetch(`/mentor/assignments/${assignmentId}/submissions`);
}

export async function deleteMentorAssignment(assignmentId) {
  return await authFetch(`/mentor/assignments/${assignmentId}`, {
    method: "DELETE"
  });
}
