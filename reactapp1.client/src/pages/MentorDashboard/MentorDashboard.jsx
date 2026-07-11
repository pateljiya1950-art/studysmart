import { useEffect, useState } from "react";
import { getMentorDashboard } from "../../services/mentorApi";
import Card from "../../components/Card";
import "./MentorDashboard.css"; // We'll create this to override stat-card stuff locally if needed

const STAT_CARDS = [
  { key: "totalStudents",    label: "Students Assigned",    icon: "🎓", color: "blue",   sub: "Active enrollments"      },
  { key: "pendingRequests",  label: "Pending Requests",     icon: "📬", color: "amber",  sub: "Awaiting your response"  },
  { key: "upcomingSessions", label: "Sessions Scheduled",   icon: "📅", color: "cyan",   sub: "Upcoming calendar"       },
  { key: "avgRating",        label: "Average Rating",       icon: "⭐", color: "green",  sub: "From student feedback"   },
];

export default function MentorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMentorDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="md-spinner">
        <div className="spinner-ring" />
        Loading dashboard…
      </div>
    );
  }

  const mentorName = data?.profile?.name ?? "Mentor";

  return (
    <div className="animate-in md-dashboard">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold">👋 Welcome back, {mentorName}</h1>
        <p className="text-secondary">Here's a live snapshot of your mentoring activity.</p>
      </div>

      {/* Stat Grid */}
      <div className="md-stat-grid">
        {STAT_CARDS.map(({ key, label, icon, color, sub }) => (
          <Card key={key} className={`md-stat-card border-top-${color}`}>
            <div className="md-stat-icon">{icon}</div>
            <div className="md-stat-label">{label}</div>
            <div className="md-stat-value text-primary">{data?.[key] ?? 0}</div>
            <div className="md-stat-sub">{sub}</div>
          </Card>
        ))}
      </div>

      {/* Quick Info Row */}
      <div className="md-info-grid">
        {/* Department */}
        <Card>
          <div className="md-card-title"><span className="icon">🏛️</span> Profile Summary</div>
          <div className="md-info-list">
            <InfoRow label="Department" value={data?.profile?.department ?? "—"} />
            <InfoRow label="Experience" value={data?.profile?.experienceYears != null ? `${data.profile.experienceYears} years` : "—"} />
            <InfoRow label="Max Capacity" value={data?.profile?.maxStudents != null ? `${data.profile.maxStudents} students` : "—"} />
          </div>
        </Card>

        {/* Tips */}
        <Card>
          <div className="md-card-title"><span className="icon">💡</span> Quick Tips</div>
          <ul className="md-tips-list">
            {[
              "Review pending requests promptly to keep students engaged.",
              "Update your availability to show accurate booking slots.",
              "Add relevant skills to attract matching students.",
            ].map((tip, i) => (
              <li key={i} className="md-tip-item">
                <span className="md-tip-arrow">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="md-info-row">
      <span className="md-info-label">{label}</span>
      <span className="md-info-value">{value}</span>
    </div>
  );
}