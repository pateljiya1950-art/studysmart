import { apiFetch } from "./api";

// Users
export const getUsers = () => apiFetch("/admin/users");
export const toggleUserStatus = (id) => apiFetch(`/admin/users/${id}/toggle-status`, { method: "PUT" });
export const updateUserRole = (id, role) => apiFetch(`/admin/users/${id}/role`, { 
  method: "PUT", 
  body: JSON.stringify({ role }) 
});
export const deleteUser = (id) => apiFetch(`/admin/users/${id}`, { method: "DELETE" });

// Mentors
export const getMentors = () => apiFetch("/admin/mentors");
export const suspendMentor = (id) => apiFetch(`/admin/mentors/${id}/suspend`, { method: "PUT" });

// Students
export const getStudents = () => apiFetch("/admin/students");

// Requests
export const getRequests = () => apiFetch("/admin/requests");
export const approveRequest = (id) => apiFetch(`/admin/requests/${id}/approve`, { method: "PUT" });
export const rejectRequest = (id) => apiFetch(`/admin/requests/${id}/reject`, { method: "PUT" });

// Sessions
export const getSessions = () => apiFetch("/admin/sessions");
export const cancelSession = (id) => apiFetch(`/admin/sessions/${id}/cancel`, { method: "PUT" });

// Assignments & Submissions
export const getAssignments = () => apiFetch("/admin/assignments");
export const getSubmissions = () => apiFetch("/admin/submissions");

// Dashboard Stats
export const getDashboardStats = () => apiFetch("/admin/dashboard");

// Announcements
export const createAnnouncement = (announcementBody) => apiFetch("/admin/announcements", { 
  method: "POST", 
  body: JSON.stringify(announcementBody) 
});

// Mentor-Student Extension
export const getMentorStudents = () => apiFetch("/admin/mentor-students");
export const assignMentorStudent = (dto) => apiFetch("/admin/mentor-students", { method: "POST", body: JSON.stringify(dto) });
export const removeMentorStudent = (id) => apiFetch(`/admin/mentor-students/${id}`, { method: "DELETE" });

// Assignments Extended
export const getMissingSubmissions = () => apiFetch("/admin/assignments/missing-submissions");
export const getInvalidSubmissions = () => apiFetch("/admin/assignments/invalid-submissions");

// Data Fix
export const fixGoalStatus = (dto) => apiFetch("/admin/goals/fix-status", { method: "PUT", body: JSON.stringify(dto) });
export const recalculateAnalytics = () => apiFetch("/admin/analytics/recalculate", { method: "POST" });

// Sessions Extended
export const getSessionConflicts = () => apiFetch("/admin/sessions/conflicts");

// Chats
export const getChats = () => apiFetch("/admin/chats");

// Skills
export const getSkills = () => apiFetch("/admin/skills");
export const createSkill = (dto) => apiFetch("/admin/skills", { method: "POST", body: JSON.stringify(dto) });
export const updateSkill = (id, dto) => apiFetch(`/admin/skills/${id}`, { method: "PUT", body: JSON.stringify(dto) });
export const deleteSkill = (id) => apiFetch(`/admin/skills/${id}`, { method: "DELETE" });

// Notifications
export const getNotifications = () => apiFetch("/admin/notifications");
export const resendNotification = (id) => apiFetch("/admin/notifications/resend", { method: "POST", body: JSON.stringify({ notifyId: id }) });
