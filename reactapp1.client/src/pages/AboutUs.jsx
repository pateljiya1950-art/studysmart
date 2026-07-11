import { useNavigate } from "react-router-dom";
import "./Home.css"; // We can reuse the home CSS for the layout shell
import "./AboutUs.css";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="home-sidebar">
        <div className="home-brand">
          <span className="home-brand-icon">📚</span>
          StudySmart
        </div>
        
        <nav className="home-nav">
          <button className="home-nav-link" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="home-nav-link" onClick={() => navigate("/about")}>
            About Us
          </button>
          <button className="home-nav-link" onClick={() => navigate("/register")}>
            Register <span className="home-dropdown-arrow">▼</span>
          </button>
          <button className="home-nav-link" onClick={() => navigate("/login")}>
            Login <span className="home-dropdown-arrow">▼</span>
          </button>
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="home-main about-main">
        <div className="about-content">
          <h1 className="about-title">About StudySmart</h1>
          
          <div className="about-text-block">
            <h3>Our Mission</h3>
            <p>
              At StudySmart, we believe that education shouldn't just be about studying harder — it should be about studying smarter. We connect dedicated students with experienced mentors to build structured, task-based learning paths that guarantee results.
            </p>
          </div>

          <div className="about-text-block">
            <h3>Why We Built This</h3>
            <p>
              Most learning platforms drown you in content without providing direction. We built StudySmart to fix the “what do I study next” problem. By combining real human accountability with advanced AI analytics, we ensure every minute of your study time pushes you toward mastery.
            </p>
          </div>

          <div className="about-text-block">
            <h3>What You Get</h3>
            <ul>
              <li><strong>Personalized Mentorship:</strong> 1-on-1 guidance from verified experts.</li>
              <li><strong>Dynamic Analytics:</strong> Real-time tracking of your strengths and weaknesses.</li>
              <li><strong>Focused Sessions:</strong> Built-in study timers and assignment workflows.</li>
            </ul>
          </div>
          
          <button className="about-cta-btn" onClick={() => navigate("/register")}>
            Join the Community
          </button>
        </div>
      </main>
    </div>
  );
}
