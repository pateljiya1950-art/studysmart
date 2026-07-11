import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiBook,
  FiActivity,
  FiCalendar,
  FiMessageSquare,
  FiLogOut,
  FiPieChart,
  FiSend,
  FiCheck,
  FiX,
  FiLock,
  FiUnlock,
  FiUserCheck,
  FiAlertCircle,
  FiTool,
  FiBell,
  FiList
} from 'react-icons/fi';
import * as adminService from '../../services/adminApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // App states
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalSessions: 0, avgRating: 0 });
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionConflicts, setSessionConflicts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [missingSubmissions, setMissingSubmissions] = useState([]);
  const [invalidSubmissions, setInvalidSubmissions] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });

  // Extended states
  const [mentorStudents, setMentorStudents] = useState([]);
  const [chats, setChats] = useState([]);
  const [skills, setSkills] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard') {
        const data = await adminService.getDashboardStats();
        setStats(data || { totalUsers: 0, activeUsers: 0, totalSessions: 0, avgRating: 0 });
      } else if (activeTab === 'users') {
        const data = await adminService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } else if (activeTab === 'mentors') {
        const data = await adminService.getMentors();
        setMentors(Array.isArray(data) ? data : []);
      } else if (activeTab === 'students') {
        const data = await adminService.getStudents();
        setStudents(Array.isArray(data) ? data : []);
      } else if (activeTab === 'requests') {
        const data = await adminService.getRequests();
        setRequests(Array.isArray(data) ? data : []);
      } else if (activeTab === 'sessions') {
        const [sessData, confData] = await Promise.all([
          adminService.getSessions(),
          adminService.getSessionConflicts()
        ]);
        setSessions(Array.isArray(sessData) ? sessData : []);
        setSessionConflicts(Array.isArray(confData) ? confData : []);
      } else if (activeTab === 'assignments') {
        const [assigData, subData, missingData, invalidData] = await Promise.all([
          adminService.getAssignments(),
          adminService.getSubmissions(),
          adminService.getMissingSubmissions(),
          adminService.getInvalidSubmissions()
        ]);
        setAssignments(Array.isArray(assigData) ? assigData : []);
        setSubmissions(Array.isArray(subData) ? subData : []);
        setMissingSubmissions(Array.isArray(missingData) ? missingData : []);
        setInvalidSubmissions(Array.isArray(invalidData) ? invalidData : []);
      } else if (activeTab === 'mentorStudents') {
        const data = await adminService.getMentorStudents();
        setMentorStudents(Array.isArray(data) ? data : []);
      } else if (activeTab === 'chats') {
        const data = await adminService.getChats();
        setChats(Array.isArray(data) ? data : []);
      } else if (activeTab === 'skills') {
        const data = await adminService.getSkills();
        setSkills(Array.isArray(data) ? data : []);
      } else if (activeTab === 'notifications') {
        const data = await adminService.getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data for this section.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- ACTIONS ---

  const handleToggleUserStatus = async (id) => {
    try { await adminService.toggleUserStatus(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleChangeRole = async (id) => {
    const role = prompt("Enter new role (student/mentor/admin):");
    if (!role) return;
    try { await adminService.updateUserRole(id, role.toLowerCase()); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? All their associated data (assignments, logs, etc.) will be permanently erased.")) return;
    try { await adminService.deleteUser(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleSuspendMentor = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this mentor?")) return;
    try { await adminService.suspendMentor(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleApproveRequest = async (id) => {
    try { await adminService.approveRequest(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleRejectRequest = async (id) => {
    try { await adminService.rejectRequest(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm("Cancel this session?")) return;
    try { await adminService.cancelSession(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await adminService.createAnnouncement(announcement);
      alert('Announcement sent successfully!');
      setAnnouncement({ title: '', message: '', target: 'all' });
    } catch (err) {
      alert(err.message);
    }
  };

  // EXTENDED ACTIONS
  const handleAssignMentorStudent = async () => {
    const mentorId = prompt("Enter Mentor ID:");
    const studentId = prompt("Enter Student ID:");
    if (!mentorId || !studentId) return;
    try { await adminService.assignMentorStudent({ mentorId: parseInt(mentorId), studentId: parseInt(studentId) }); fetchData(); } catch (err) { alert("Failed or mapping exists."); }
  };

  const handleRemoveMentorStudent = async (id) => {
    if (!window.confirm("Remove this exact assignment?")) return;
    try { await adminService.removeMentorStudent(id); fetchData(); } catch (err) { alert(err.message); }
  };



  const handleAddSkill = async () => {
    const name = prompt("Enter new Skill Name:");
    if (!name) return;
    try { await adminService.createSkill({ skillName: name }); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Delete skill?")) return;
    try { await adminService.deleteSkill(id); fetchData(); } catch (err) { alert(err.message); }
  };

  const handleResendNotification = async (id) => {
    try { await adminService.resendNotification(id); alert("Resent!"); } catch (err) { alert(err.message); }
  };

  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label"><FiUsers /> Total Users</div>
        <div className="stat-value">{stats.totalUsers}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label"><FiActivity /> Active Users</div>
        <div className="stat-value">{stats.activeUsers}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label"><FiCalendar /> Total Sessions</div>
        <div className="stat-value">{stats.totalSessions}</div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.name || u.firstName + ' ' + u.lastName || 'N/A'}</td>
              <td>{u.email}</td>
              <td><span className="status-badge" style={{ background: 'var(--admin-accent-soft)', color: 'var(--admin-accent)' }}>{u.role}</span></td>
              <td>
                <span className={`status-badge ${u.status ? 'status-active' : 'status-inactive'}`}>
                  {u.status ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleToggleUserStatus(u.userId)} className={u.status ? "btn btn-warning" : "btn btn-success"} title="Toggle Status">
                    {u.status ? <FiLock /> : <FiUnlock />}
                  </button>
                  <button onClick={() => handleChangeRole(u.userId)} className="btn btn-primary" title="Change Role"><FiUserCheck /></button>
                  <button onClick={() => handleDeleteUser(u.userId)} className="btn btn-danger" title="Delete User"><FiX /></button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan="5">No users found</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderMentors = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Students Count</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mentors.map(m => (
            <tr key={m.mentorId}>
              <td>{m.name || m.userName || 'Unknown'}</td>
              <td>{m.totalStudents || 0}</td>
              <td>{m.avgRating || '0'}</td>
              <td>
                <button onClick={() => handleSuspendMentor(m.mentorId)} className="btn btn-danger"><FiAlertCircle /> Suspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStudents = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Productivity Score</th><th>Study Time (hrs)</th></tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s.studentId}>
              <td>{s.name || s.userName || 'Unknown'}</td>
              <td><span className="status-badge" style={{ background: 'var(--admin-accent-soft)', color: 'var(--admin-accent)' }}>{s.productivityScore || 0}</span></td>
              <td>{s.studyMinutes || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRequests = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Student</th><th>Mentor</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.requestId}>
              <td>#{r.requestId}</td>
              <td>{r.studentName}</td>
              <td>{r.mentorName}</td>
              <td><span className={`status-badge status-${r.status?.toLowerCase() || 'pending'}`}>{r.status || 'Pending'}</span></td>
              <td>
                {(!r.status || r.status.toLowerCase() === 'pending') && (
                  <div className="action-buttons">
                    <button onClick={() => handleApproveRequest(r.requestId)} className="btn btn-success"><FiCheck /></button>
                    <button onClick={() => handleRejectRequest(r.requestId)} className="btn btn-danger"><FiX /></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSessions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {sessionConflicts.length > 0 && (
        <div style={{ background: 'var(--admin-danger-soft)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
          <h3 style={{ color: 'var(--admin-danger)', marginTop: 0 }}>⚠️ Scheduling Conflicts Detected!</h3>
          <div className="admin-table-container" style={{ marginBottom: 0 }}>
            <table className="admin-table">
              <thead><tr><th>Mentor ID</th><th>Mentor Name</th><th>Date</th><th>Conflict Times</th></tr></thead>
              <tbody>
                {sessionConflicts.map((sc, i) => (
                  <tr key={i}>
                    <td>#{sc.mentorId}</td>
                    <td>{sc.mentorName}</td>
                    <td>{sc.sessionDate}</td>
                    <td><strong style={{ color: 'var(--admin-danger)' }}>{sc.startTime1}</strong> overlaps with <strong style={{ color: 'var(--admin-danger)' }}>{sc.startTime2}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div>
        <h3>All Sessions</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Title</th><th>Mentor</th><th>Student</th><th>Date / Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.sessionId}>
                  <td>#{s.sessionId}</td>
                  <td>{s.title || 'Session'}</td>
                  <td>{s.mentorName}</td>
                  <td>{s.studentName}</td>
                  <td>{s.sessionDate} at {s.startTime}</td>
                  <td><span className={`status-badge status-${s.status?.toLowerCase() || 'active'}`}>{s.status || 'Active'}</span></td>
                  <td>
                    {(s.status?.toLowerCase() !== 'cancelled') && (
                      <button onClick={() => handleCancelSession(s.sessionId)} className="btn btn-warning" title="Cancel"><FiX /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {missingSubmissions.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--admin-warning)', marginTop: 0 }}>⚠️ Missing Submissions (Mentor Assigned)</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Student</th><th>Mentor</th><th>Assignment Missing</th></tr></thead>
              <tbody>
                {missingSubmissions.map((m, i) => (
                  <tr key={i}>
                    <td>{m.studentName}</td>
                    <td>{m.mentorName}</td>
                    <td>{m.assignmentTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invalidSubmissions.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--admin-danger)', marginTop: 0 }}>🛑 Invalid Submissions (No File Attached)</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Student</th><th>Assignment</th><th>File Path Info</th></tr></thead>
              <tbody>
                {invalidSubmissions.map((inv, i) => (
                  <tr key={i}>
                    <td>{inv.studentName}</td>
                    <td>{inv.assignmentTitle}</td>
                    <td>{inv.filePath || 'NULL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3>All Assignments & Base Submissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Mentor</th></tr></thead>
              <tbody>
                {assignments.map(a => <tr key={a.assignmentId}><td>{a.title}</td><td>{a.mentorName}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Assignment</th><th>Student</th><th>Score</th></tr></thead>
              <tbody>
                {submissions.map(s => <tr key={s.submissionId}><td>{s.assignmentTitle}</td><td>{s.studentName}</td><td>{s.score || 'N/A'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMentorStudents = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button onClick={handleAssignMentorStudent} className="btn btn-primary" style={{ width: 'fit-content' }}>
        <FiCheck /> Force Map Student ➔ Mentor
      </button>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Mentor</th><th>Student</th><th>Assigned At</th><th>Actions</th></tr></thead>
          <tbody>
            {mentorStudents.map(ms => (
              <tr key={ms.id}>
                <td>#{ms.id}</td>
                <td>{ms.mentorName} <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>(ID: {ms.mentorId})</span></td>
                <td>{ms.studentName} <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>(ID: {ms.studentId})</span></td>
                <td>{ms.assignedAt ? new Date(ms.assignedAt).toLocaleString() : 'N/A'}</td>
                <td>
                  <button onClick={() => handleRemoveMentorStudent(ms.id)} className="btn btn-danger"><FiX /> Remove Link</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead><tr><th>Time</th><th>Sender</th><th>Receiver</th><th>Message</th></tr></thead>
        <tbody>
          {chats.map(c => (
            <tr key={c.messageId}>
              <td>{c.sentAt ? new Date(c.sentAt).toLocaleString() : ''}</td>
              <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>{c.senderName}</td>
              <td style={{ fontWeight: 600, color: 'var(--admin-accent-2)' }}>{c.receiverName}</td>
              <td>{c.messageText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSkills = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button onClick={handleAddSkill} className="btn btn-success" style={{ width: 'fit-content' }}>
        + Register New Skill
      </button>
      <div className="admin-table-container" style={{ maxWidth: '600px' }}>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Skill Name</th><th>Actions</th></tr></thead>
          <tbody>
            {skills.map(sk => (
              <tr key={sk.skillId}>
                <td>{sk.skillId}</td>
                <td>{sk.skillName}</td>
                <td><button onClick={() => handleDeleteSkill(sk.skillId)} className="btn btn-danger"><FiX /> Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotificationsPanel = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead><tr><th>Target User</th><th>Message</th><th>State</th><th>Time</th><th>Action</th></tr></thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.notifyId}>
              <td>{n.userName} (ID: {n.userId})</td>
              <td>{n.message}</td>
              <td><span className={`status-badge ${n.isRead ? 'status-active' : 'status-pending'}`}>{n.isRead ? 'Read' : 'Unread'}</span></td>
              <td>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</td>
              <td><button onClick={() => handleResendNotification(n.notifyId)} className="btn btn-primary" title="Resend"><FiSend /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnnouncements = () => (
    <form className="admin-form" onSubmit={handleSendAnnouncement}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>Send Global Announcement</h3>
      <div className="form-group">
        <label>Message</label>
        <textarea className="form-control" rows="4" required value={announcement.message} onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}></textarea>
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        <FiSend /> Broadcast Message
      </button>
    </form>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'mentors': return renderMentors();
      case 'students': return renderStudents();
      case 'requests': return renderRequests();
      case 'mentorStudents': return renderMentorStudents();
      case 'sessions': return renderSessions();
      case 'assignments': return renderAssignments();
      case 'chats': return renderChats();
      case 'skills': return renderSkills();
      case 'notifications': return renderNotificationsPanel();
      case 'announcements': return renderAnnouncements();
      default: return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ overflowY: 'auto' }}>
        <div className="admin-logo">
          <FiBook /> StudySmart Admin
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 10, marginBottom: 5, marginLeft: 10 }}>System Overview</div>
        <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><FiPieChart /> Dashboard</button>
        <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FiUsers /> Users</button>
        <button className={`admin-nav-item ${activeTab === 'mentors' ? 'active' : ''}`} onClick={() => setActiveTab('mentors')}><FiUserCheck /> Mentors</button>
        <button className={`admin-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><FiActivity /> Students</button>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 15, marginBottom: 5, marginLeft: 10 }}>Core Management</div>
        <button className={`admin-nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}><FiList /> Requests</button>
        <button className={`admin-nav-item ${activeTab === 'mentorStudents' ? 'active' : ''}`} onClick={() => setActiveTab('mentorStudents')}><FiUsers /> Mappings</button>
        <button className={`admin-nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}><FiCalendar /> Sessions</button>
        <button className={`admin-nav-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}><FiBook /> Assignments</button>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 15, marginBottom: 5, marginLeft: 10 }}>Monitoring & Tools</div>
        <button className={`admin-nav-item ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}><FiMessageSquare /> Chats</button>
        <button className={`admin-nav-item ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}><FiAlertCircle /> Skills</button>
        <button className={`admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}><FiBell /> Notifications</button>
        <button className={`admin-nav-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}><FiSend /> Announcements</button>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>
            {activeTab === 'mentorStudents' ? 'Mentor-Student Mappings'
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <button className="admin-logout-btn" onClick={handleLogout}><FiLogOut /> Logout</button>
        </div>

        {error && <div className="error-message"><FiAlertCircle /> {error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading data...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
