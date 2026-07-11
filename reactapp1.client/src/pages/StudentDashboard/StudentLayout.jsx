import Layout from "../../components/Layout";
import {
  FaTachometerAlt, FaUser, FaTasks, FaChartBar,
  FaSearch, FaCommentDots, FaGraduationCap,
  FaFileAlt, FaBook, FaBullseye, FaLightbulb,
  FaVideo, FaCalendarAlt, FaBell
} from "react-icons/fa";

const studentNavItems = [
  { to: "dashboard",           label: "Dashboard",          icon: <FaTachometerAlt /> },
  { to: "profile",             label: "Profile",            icon: <FaUser /> },
  { to: "tasks",               label: "Tasks",              icon: <FaTasks /> },
  { to: "analytics",           label: "Analytics",          icon: <FaChartBar /> },
  { to: "mentordiscovery",     label: "Mentor Discovery",   icon: <FaSearch /> },
  { to: "chat",                label: "Mentor Chat",        icon: <FaCommentDots /> },
  { to: "exams",               label: "Exams",              icon: <FaGraduationCap /> },
  { to: "exam-results",        label: "Exam Results",       icon: <FaChartBar /> },
  { to: "assignments",         label: "Assignments",        icon: <FaFileAlt /> },
  { to: "notes",               label: "Notes",              icon: <FaBook /> },
  { to: "materials",           label: "Materials",          icon: <FaBook /> },
  { to: "goals",               label: "Goals",              icon: <FaBullseye /> },
  { to: "reflection",          label: "Reflection",         icon: <FaLightbulb /> },
  { to: "sessions",            label: "My Sessions",        icon: <FaVideo /> },
  { to: "feedback",            label: "Mentor Feedback",    icon: <FaCommentDots /> },
  { to: "calendar",            label: "Calendar",           icon: <FaCalendarAlt /> },
  { to: "notifications",       label: "Notifications",      icon: <FaBell /> },
];

export default function StudentLayout() {
  return <Layout navItems={studentNavItems} />;
}