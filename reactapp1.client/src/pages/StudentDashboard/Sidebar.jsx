import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaUser, FaTasks, FaClock, FaChartBar,
  FaSearch, FaStar, FaFileAlt, FaBook, FaBullseye,
  FaLightbulb, FaSignOutAlt, FaGraduationCap, FaCalendarAlt, FaBell, FaCommentDots, FaVideo
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
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

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <span className="sidebar-logo-text">StudySmart</span>
      </div>

      {/* Nav Label */}
      <p className="sidebar-section-label">Main Menu</p>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className="sidebar-link">
            <span className="sidebar-link-icon">{icon}</span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={logout} className="sidebar-logout">
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
}