import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import "./MentorDiscovery.css";

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

export default function StudentNotifications() {
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
    <div className="md">
      <div className="md-header">
        <div>
          <h1 className="md-title">🔔 Notifications</h1>
          <p className="md-subtitle">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            padding: "10px 18px", background: "#eef2ff", color: "#4338ca",
            border: "2px solid #c7d2fe", borderRadius: 10, fontWeight: 700,
            cursor: "pointer", fontSize: 13
          }}>
            ✓ Mark all read
          </button>
        )}
      </div>

      {error && <div className="md-error">⚠️ {error}</div>}

      {loading ? (
        <div className="md-loading"><div className="md-spinner" /><p>Loading…</p></div>
      ) : notifications.length === 0 ? (
        <div className="md-empty-state" style={{ flexDirection: "column", gap: 12, padding: 60 }}>
          <span style={{ fontSize: 48 }}>🔕</span>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map(n => (
            <div key={n.notifyId} onClick={() => !n.isRead && markRead(n.notifyId)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
              background: n.isRead ? "white" : "#eef2ff",
              border: `1px solid ${n.isRead ? "#f1f5f9" : "#c7d2fe"}`,
              borderLeft: `4px solid ${n.isRead ? "#e2e8f0" : "#6366f1"}`,
              borderRadius: 10, cursor: n.isRead ? "default" : "pointer",
              transition: "all 0.2s"
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: n.isRead ? "#e2e8f0" : "#6366f1"
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: "#1e293b", fontSize: 14, lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(n.createdAt)}</span>
              </div>
              {!n.isRead && (
                <span style={{
                  background: "#6366f1", color: "white", borderRadius: 20,
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
