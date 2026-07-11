import { authFetch } from './authService';

export const fetchStudents = async () => {
    try {
        const data = await authFetch('/mentor/students', { method: 'GET' });
        return data || [];
    } catch (error) {
        console.error("Error fetching mentor students:", error);
        return [];
    }
};