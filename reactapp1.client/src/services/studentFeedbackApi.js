import { authFetch } from "./authService";

export async function submitFeedback(data) {
  await authFetch("/student/feedback", {
    method: "POST",
    body: JSON.stringify(data)
  });
}