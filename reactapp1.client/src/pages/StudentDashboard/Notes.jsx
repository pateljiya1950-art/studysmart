import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";
import { FaPlus, FaTrash, FaStickyNote, FaRegEdit, FaSearch } from "react-icons/fa";
import "./Notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const data = await authFetch("/student/notes");
      setNotes(data || []);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await authFetch("/student/notes", {
        method: "POST",
        body: JSON.stringify({ title, content })
      });
      setTitle("");
      setContent("");
      setIsFormOpen(false); // Close form after adding
      loadNotes();
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await authFetch(`/student/notes/${id}`, { method: "DELETE" });
      loadNotes();
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  // Filter notes locally by search term
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nt">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="nt-header">
        <div>
          <h1 className="nt-title">My Notes</h1>
          <p className="nt-subtitle">Capture your thoughts, ideas, and study summaries</p>
        </div>
        
        {/* Search Bar */}
        <div className="nt-search-box">
          <FaSearch className="nt-search-icon" />
          <input 
            className="nt-search-input" 
            placeholder="Search notes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── ADD NOTE FORM ───────────────────────────────────────── */}
      <div className="nt-creator-wrap">
        {!isFormOpen ? (
          <button className="nt-btn-open-form" onClick={() => setIsFormOpen(true)}>
            <FaPlus /> Take a note...
          </button>
        ) : (
          <form className="nt-form" onSubmit={addNote}>
            <input
              className="nt-form-title"
              placeholder="Note Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
            <textarea
              className="nt-form-content"
              placeholder="Jot down your thoughts..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={4}
            />
            <div className="nt-form-footer">
              <button 
                type="button" 
                className="nt-btn-cancel" 
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="nt-btn-save">
                <FaRegEdit /> Save Note
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── NOTES GRID ──────────────────────────────────────────── */}
      {filteredNotes.length === 0 ? (
        <div className="nt-empty">
          <FaStickyNote className="nt-empty-icon" />
          <p>{search ? "No notes mapped to your search." : "Your notebook is empty."}</p>
          <span>{search ? "Try a different keyword." : "Click 'Take a note...' above to get started."}</span>
        </div>
      ) : (
        <div className="nt-grid">
          {filteredNotes.map(note => (
            <div key={note.noteId} className="nt-card">
              <div className="nt-card-body">
                <h4 className="nt-card-title">{note.title}</h4>
                <p className="nt-card-content">{note.content}</p>
              </div>
              <div className="nt-card-footer">
                <span className="nt-card-date">
                  {/* Since API doesn't return dates right now, we leave it simple */}
                  Personal Note
                </span>
                <button 
                  className="nt-btn-delete" 
                  onClick={() => deleteNote(note.noteId)}
                  title="Delete note"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}