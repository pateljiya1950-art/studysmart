import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";

function timeAgo(dt) {
  if (!dt) return "";
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MentorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchNotifications = () => {
    setLoading(true);
    authFetch("/notifications")
      .then(setNotifications)
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await authFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.notifyId === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await authFetch("/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🔔 Notifications</h1>
          <p>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            padding: "8px 16px", background: "rgba(99, 102, 241, 0.1)", color: "var(--accent)",
            border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 8, fontWeight: 600,
            cursor: "pointer", fontSize: 14
          }}>
            ✓ Mark all read
          </button>
        )}
      </div>

      {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: 14, borderRadius: 8, marginBottom: 16 }}>⚠️ {error}</div>}

      {loading ? (
        <div className="md-spinner">
          <div className="spinner-ring" />
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: "column", gap: 12, padding: 60, alignItems: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: 48 }}>🔕</span>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map(n => (
            <div key={n.notifyId} onClick={() => !n.isRead && markRead(n.notifyId)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              background: n.isRead ? "var(--bg-secondary)" : "rgba(99, 102, 241, 0.1)",
              border: `1px solid ${n.isRead ? "var(--border)" : "rgba(99, 102, 241, 0.3)"}`,
              borderLeft: `4px solid ${n.isRead ? "var(--border)" : "var(--accent)"}`,
              borderRadius: 10, cursor: n.isRead ? "default" : "pointer",
              transition: "all 0.2s"
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: n.isRead ? "var(--border)" : "var(--accent)"
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: "var(--text-primary)", fontSize: 15, lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{timeAgo(n.createdAt)}</span>
              </div>
              {!n.isRead && (
                <span style={{
                  background: "var(--accent)", color: "white", borderRadius: 20,
                  padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>New</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
