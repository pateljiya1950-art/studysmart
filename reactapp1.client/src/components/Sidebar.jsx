import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar({ navItems = [], userRole = "Student" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="app-sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg className="brand-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <span className="brand-name">StudySmart</span>
      </div>

      <div className="sidebar-menu-label">Main Menu</div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
