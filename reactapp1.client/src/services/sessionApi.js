/**
 * sessionApi.js
 *
 * Wraps the existing ASP.NET Core backend (https://localhost:7214/api)
 * using authFetch — which carries the JWT and handles HTTPS correctly.
 *
 * Routes:
 *   POST   /api/mentor/sessions          → createSession  (mentor)
 *   GET    /api/mentor/sessions          → getMentorSessionsApi
 *   DELETE /api/mentor/sessions/:id      → deleteSession
 *   GET    /api/student/sessions         → getStudentSessionsApi (uses JWT identity)
 */

import { authFetch } from "./authService";

/* ─── Mentor: Create a session ──────────────────────────────── */
export async function createSession(payload) {
  console.log("[sessionApi] createSession →", payload);
  // Ensure we send StudentIds as an array of numbers
  const ids = Array.isArray(payload.studentIds) 
    ? payload.studentIds.map(Number) 
    : (payload.studentId ? [Number(payload.studentId)] : []);
    
  return authFetch("/mentor/sessions", {
    method: "POST",
    body: JSON.stringify({
      studentIds:  ids,
      title:       payload.title || payload.Title,
      date:        payload.date || payload.Date,
      startTime:   payload.startTime || payload.StartTime,
      endTime:     payload.endTime || payload.EndTime,
      meetingLink: payload.meetingLink || payload.MeetingLink,
    }),
  });
}

/* ─── Mentor: Get own sessions ──────────────────────────────── */
export async function getMentorSessions() {
  console.log("[sessionApi] getMentorSessions →");
  const data = await authFetch("/mentor/sessions");
  console.log("[sessionApi] mentor sessions response:", data);
  return Array.isArray(data) ? data : [];
}

/* ─── Student: Get own sessions (identity from JWT) ─────────── */
export async function getStudentSessions() {
  console.log("[sessionApi] getStudentSessions →");
  const data = await authFetch("/student/sessions");
  console.log("[sessionApi] student sessions response:", data);
  return Array.isArray(data) ? data : [];
}

/* ─── Mentor: Delete a session ──────────────────────────────── */
export async function deleteSession(id) {
  console.log("[sessionApi] deleteSession →", id);
  return authFetch(`/mentor/sessions/${id}`, { method: "DELETE" });
}

/* ─────────────────────────────────────────────────────────────
   Join-Button Helpers (pure client-side, no network call)

   session.sessionDate  = "YYYY-MM-DD"
   session.startTime    = "HH:mm"
   session.endTime      = "HH:mm"

   Parsing WITHOUT a trailing Z so the browser treats the string
   as LOCAL time (not UTC), giving correct join-window behaviour.
───────────────────────────────────────────────────────────── */

/** @returns {"before" | "live" | "ended"} */
export function getSessionStatus(session) {
  const date  = session.sessionDate || session.date || "";
  const start = session.startTime   || "";
  const end   = session.endTime     || "";

  if (!date || !start || !end) return "ended";

  const now      = new Date();
  const startDt  = new Date(`${date}T${start}:00`);
  const endDt    = new Date(`${date}T${end}:00`);

  if (now < startDt)                return "before";
  if (now >= startDt && now <= endDt) return "live";
  return "ended";
}

/** Returns true only when the session window is currently open. */
export function canJoin(session) {
  return getSessionStatus(session) === "live";
}
