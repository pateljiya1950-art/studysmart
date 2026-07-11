import Layout from "../../components/Layout";
import {
  FaHome, FaUser, FaInbox, FaUserGraduate,
  FaCalendarAlt, FaClipboardList, FaFileAlt, FaTrophy,
  FaClock, FaComments, FaStar, FaChartBar, FaBell
} from "react-icons/fa";

const mentorNavItems = [
  { to: "dashboard",       label: "Dashboard",   icon: <FaHome /> },
  { to: "profile",         label: "Profile",     icon: <FaUser /> },
  { to: "requests",        label: "Requests",    icon: <FaInbox /> },
  { to: "students",        label: "Students",    icon: <FaUserGraduate /> },
  { to: "sessions",        label: "Sessions",    icon: <FaCalendarAlt /> },
  { to: "assignments",     label: "Assignments", icon: <FaClipboardList /> },
  { to: "exams",           label: "Exams",       icon: <FaFileAlt /> },
  { to: "exam-analytics",  label: "Exam Results",icon: <FaTrophy /> },
  { to: "availability",    label: "Availability",icon: <FaClock /> },
  { to: "chat",            label: "Student Chat",icon: <FaComments /> },
  { to: "feedback",        label: "Feedback",    icon: <FaStar /> },
  { to: "analytics",       label: "Analytics",   icon: <FaChartBar /> },
  { to: "notifications",   label: "Notifications",icon: <FaBell /> },
];

export default function MentorLayout() {
  return <Layout navItems={mentorNavItems} />;
}