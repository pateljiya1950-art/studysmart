import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./MentorLayout.css";

const NAV_ITEMS = [
  { to: "/mentor/dashboard",    icon: "🏠", label: "Dashboard"   },
  { to: "/mentor/profile",      icon: "👤", label: "Profile"     },
  { to: "/mentor/requests",     icon: "📬", label: "Requests"    },
  { to: "/mentor/students",     icon: "🎓", label: "Students"    },
  { to: "/mentor/sessions",     icon: "📅", label: "Sessions"    },
  { to: "/mentor/assignments",  icon: "📋", label: "Assignments" },
  { to: "/mentor/exams",          icon: "📝", label: "Exams"         },
  { to: "/mentor/exam-analytics",  icon: "🏆", label: "Exam Results"  },
  { to: "/mentor/availability",   icon: "🕐", label: "Availability"  },
  { to: "/mentor/chat",         icon: "💬", label: "Student Chat" },
  { to: "/mentor/feedback",     icon: "⭐", label: "Feedback"    },
  { to: "/mentor/analytics",    icon: "📊", label: "Analytics"   },
  { to: "/mentor/notifications",icon: "🔔", label: "Notifications"},
];

export default function MentorSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="mentor-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🎯</div>
        <h2>MentorHub</h2>
        <p>Mentor Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <button onClick={logout} style={{
          width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
          background: "transparent", border: "1px solid var(--border)", borderRadius: 10,
          color: "#ef4444", cursor: "pointer", fontSize: 15, fontWeight: 600, transition: "0.2s"
        }}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}