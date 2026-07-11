import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";

/* ================= STUDENT ================= */
import StudentLayout from "./pages/StudentDashboard/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentProfile from "./pages/StudentDashboard/StudentProfile";
import Tasks from "./pages/StudentDashboard/Tasks";
import StudyTimer from "./pages/StudentDashboard/StudyTimer";
import MentorDiscovery from "./pages/StudentDashboard/MentorDiscovery";
import StudentChat from "./pages/StudentDashboard/StudentChat";
import RecommendedMentors from "./pages/StudentDashboard/RecommendedMentors";
import StudentFeedback from "./pages/StudentDashboard/StudentFeedback";
import WeeklyMonthlyAnalytics from "./pages/StudentDashboard/WeeklyMonthlyAnalytics";
import Exams from "./pages/StudentDashboard/Exams";
import Assignments from "./pages/StudentDashboard/Assignments";
import Notes from "./pages/StudentDashboard/Notes";
import Materials from "./pages/StudentDashboard/Materials";
import Goals from "./pages/StudentDashboard/Goals";
import Reflection from "./pages/StudentDashboard/Reflection";
import StudentSessions from "./pages/StudentDashboard/StudentSessions";
import StudentFeedbackPage from "./pages/StudentDashboard/StudentFeedback";
import StudentCalendar from "./pages/StudentDashboard/StudentCalendar";
import StudentNotifications from "./pages/StudentDashboard/StudentNotifications";
import ExamAttempt from "./pages/Student/ExamAttempt";
import ExamResultView from "./pages/Student/ExamResultView";

/* ================= MENTOR ================= */
import MentorLayout from "./pages/MentorDashboard/MentorLayout";
import MentorDashboard from "./pages/MentorDashboard/MentorDashboard";
import MentorProfile from "./pages/MentorDashboard/MentorProfile";
import MentorRequests from "./pages/MentorDashboard/MentorRequests";
import MentorStudents from "./pages/MentorDashboard/MentorStudents";
import MentorSessions from "./pages/MentorDashboard/MentorSessions";
import MentorExams from "./pages/MentorDashboard/MentorExams";
import MentorAssignments from "./pages/MentorDashboard/MentorAssignments";
import MentorAvailability from "./pages/MentorDashboard/MentorAvailability";
import MentorFeedback from "./pages/MentorDashboard/MentorFeedback";
import MentorAnalytics from "./pages/MentorDashboard/MentorAnalytics";
import MentorChat from "./pages/MentorDashboard/MentorChat";
import ExamCreate from "./pages/Mentor/ExamCreate";
import ExamAnalytics from "./pages/Mentor/ExamAnalytics";
import MentorNotifications from "./pages/MentorDashboard/MentorNotifications";

/* ================= ADMIN ================= */
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

/* ================= PRIVATE ROUTE ================= */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

/* ================= ADMIN ROUTE ================= */
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return (token && role === "admin") ? children : <Navigate to="/login" replace />;
}

/* ================= APP ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= STUDENT ROUTES (NESTED) ================= */}
       <Route
  path="/student"
  element={
    <PrivateRoute>
      <StudentLayout />
    </PrivateRoute>
  }
>
  <Route index element={<Navigate to="dashboard" replace />} />

  <Route path="dashboard" element={<StudentDashboard />} />
  <Route path="profile" element={<StudentProfile />} />
  <Route path="tasks" element={<Tasks />} />
  <Route path="study" element={<StudyTimer />} />
  <Route path="analytics" element={<WeeklyMonthlyAnalytics />} />
  <Route path="mentordiscovery" element={<MentorDiscovery/>}/>
  <Route path="chat" element={<StudentChat />}/>
  <Route path="exams" element={<Exams />} />
  <Route path="assignments" element={<Assignments />} />
  <Route path="notes" element={<Notes />} />
  <Route path="materials" element={<Materials />} />
  <Route path="goals" element={<Goals />} />
  <Route path="reflection" element={<Reflection />} />
  <Route path="sessions"   element={<StudentSessions />} />
  <Route path="feedback"   element={<StudentFeedbackPage />} />
  <Route path="calendar"   element={<StudentCalendar />} />
  <Route path="notifications" element={<StudentNotifications />} />
  <Route path="exam-attempt/:assignmentId/:examId" element={<ExamAttempt />} />
  <Route path="exam-results" element={<ExamResultView />} />
</Route>

        {/* ================= MENTOR ROUTES (NESTED) ================= */}
        <Route
          path="/mentor"
          element={
            <PrivateRoute>
              <MentorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="profile" element={<MentorProfile />} />
          <Route path="requests" element={<MentorRequests />} />
          <Route path="students" element={<MentorStudents />} />
          <Route path="sessions" element={<MentorSessions />} />
          <Route path="exams" element={<MentorExams />} />
          <Route path="assignments" element={<MentorAssignments />} />
          <Route path="availability" element={<MentorAvailability />} />
          <Route path="feedback" element={<MentorFeedback />} />
          <Route path="analytics" element={<MentorAnalytics />} />
          <Route path="chat" element={<MentorChat />} />
          <Route path="exam-create" element={<ExamCreate />} />
          <Route path="exam-analytics" element={<ExamAnalytics />} />
          <Route path="notifications" element={<MentorNotifications />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}