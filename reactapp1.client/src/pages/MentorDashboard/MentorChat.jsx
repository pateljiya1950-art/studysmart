import { useEffect, useState, useRef } from "react";
import { authFetch } from "../../services/authService";
import { FaPaperPlane, FaUserCircle, FaSpinner } from "react-icons/fa";


export default function MentorChat() {
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // Fetch enrolled students
  useEffect(() => {
    authFetch("/mentor/students")
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setStudents(arr);
        if (arr.length > 0) setActiveStudent(arr[0].studentId);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Fetch chat history
  useEffect(() => {
    if (!activeStudent) return;
    setMessages([]);
    authFetch(`/chat/${activeStudent}`)
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, [activeStudent]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeStudent || sending) return;

    setSending(true);
    try {
      const newMsg = await authFetch(`/chat/${activeStudent}`, {
        method: "POST",
        body: JSON.stringify({ text })
      });
      setMessages(prev => [...prev, newMsg]);
      setText("");
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading chat...</div>;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 40px)", background: "var(--bg-card, #ffffff)", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", margin: 20 }}>
      {/* Sidebar: Students list */}
      <div style={{ width: 280, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
          My Students
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {students.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: "var(--text-muted)" }}>You have no enrolled students to chat with.</div>
          ) : (
            students.map(s => (
              <div
                key={s.studentId}
                onClick={() => setActiveStudent(s.studentId)}
                style={{
                  padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  background: activeStudent === s.studentId ? "var(--accent-soft)" : "transparent",
                  borderLeft: activeStudent === s.studentId ? "3px solid var(--accent)" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <FaUserCircle size={32} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.course}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeStudent ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
          {/* Chat Header */}
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div style={{ fontWeight: 600 }}>Chat with {students.find(s => s.studentId === activeStudent)?.name}</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", color: "var(--text-muted)", fontSize: 14 }}>Send a message to start the conversation!</div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderType === "Mentor";
                return (
                  <div key={msg.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    <div style={{
                      background: isMine ? "var(--accent)" : "var(--bg-card)",
                      color: isMine ? "#fff" : "var(--text-primary)",
                      padding: "10px 16px", borderRadius: "16px",
                      borderBottomRightRadius: isMine ? "4px" : "16px",
                      borderBottomLeftRadius: !isMine ? "4px" : "16px",
                      border: isMine ? "none" : "1px solid var(--border)"
                    }}>
                      {msg.messageText}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, textAlign: isMine ? "right" : "left" }}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input */}
          <form style={{ padding: 20, background: "var(--bg-card)", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }} onSubmit={handleSend}>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your response..."
              style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "12px 16px", borderRadius: 20, outline: "none" }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{ background: "var(--accent)", color: "#fff", border: "none", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1 }}
            >
              {sending ? <FaSpinner className="fa-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          Select a student to start chatting
        </div>
      )}
    </div>
  );
}
