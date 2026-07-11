import { authFetch } from "./authService";

export const createAdvancedExam = async (examData) => {
    try {
        return await authFetch("/advancedexams/create", {
            method: "POST",
            body: JSON.stringify(examData),
        });
    } catch (error) {
        console.error("Error creating exam:", error);
        return { success: false };
    }
};

export const generateAIQuestions = async (requestData) => {
    try {
        return await authFetch("/advancedexams/ai-generate", {
            method: "POST",
            body: JSON.stringify(requestData),
        });
    } catch (error) {
        console.error("Error generating AI questions:", error);
        return [];
    }
};

export const getAdvancedExam = async (examId) => {
    try {
        return await authFetch(`/advancedexams/${examId}`);
    } catch (error) {
        console.error("Error fetching exam:", error);
        return null;
    }
};

export const submitAdvancedExam = async (submissionData) => {
    try {
        return await authFetch("/advancedexams/submit", {
            method: "POST",
            body: JSON.stringify(submissionData),
        });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return { success: false };
    }
};

export const getStudentExamResults = async () => {
    try {
        return await authFetch(`/advancedexams/my-results`);
    } catch (error) {
        console.error("Error fetching results:", error);
        return [];
    }
};

export const getMentorExamResults = async () => {
    try {
        return await authFetch(`/advancedexams/mentor-results`);
    } catch (error) {
        console.error("Error fetching mentor results:", error);
        return [];
    }
};
