import { authFetch } from "./authService";

const API_URL = "/api"; // ⚠️ IMPORTANT: remove duplicate base URL

/* ================= MENTOR ================= */

export const getMentorExams = async () => {
    try {
        return await authFetch("/exams");
    } catch (error) {
        console.error("Error fetching mentor exams:", error);
        return [];
    }
};

export const createExam = async (examData) => {
    try {
        const res = await authFetch("/exams", {
            method: "POST",
            body: JSON.stringify(examData),
        });
        return res ?? { success: false, message: "Empty response from server" };
    } catch (error) {
        console.error("Error creating exam:", error);
        return { success: false, message: error.message || "Failed to create exam" };
    }
};

export const assignExam = async (assignmentData) => {
    console.log("[assignExam] Payload:", assignmentData);
    try {
        const res = await authFetch("/exams/assign", {
            method: "POST",
            body: JSON.stringify(assignmentData),
        });
        console.log("[assignExam] Response:", res);
        return res ?? { success: false, message: "Empty response from server" };
    } catch (error) {
        console.error("[assignExam] Error:", error);
        return { success: false, message: error.message || "Failed to assign exam" };
    }
};

/* ================= STUDENT ================= */

export const getStudentExams = async () => {
    try {
        return await authFetch("/student/exams");
    } catch (error) {
        console.error("Error fetching student exams:", error);
        return [];
    }
};

export const submitExam = async (submissionData) => {
    try {
        return await authFetch("/student/exams/submit", {
            method: "POST",
            body: JSON.stringify(submissionData),
        });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return { success: false };
    }
};