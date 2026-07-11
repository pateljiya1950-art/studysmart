import { authFetch } from "./authService";

export async function getCalendarEvents() {
  return await authFetch("/calendar");
}