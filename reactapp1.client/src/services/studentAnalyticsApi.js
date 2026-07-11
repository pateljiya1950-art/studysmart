import { authFetch } from "./authService";

export async function getDailyAnalytics() {
  return await authFetch("/student/analytics/daily");
}

export async function getWeeklyAnalytics() {
  return await authFetch("/student/analytics/weekly");
}