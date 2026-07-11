import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
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
            Register 
          </button>
          <button className="home-nav-link" onClick={() => navigate("/login")}>
            Login 
          </button>
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="home-main">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="home-bg-video"
          poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80"
        >
          <source src="/student-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay to make text pop */}
        <div className="home-overlay"></div>

        {/* Center Typography matching requested format */}
        <div className="home-center-content">
          <h1 className="home-title">Study Smart</h1>
          <p className="home-subtitle">Connect with Mentors and Ace Your Exams</p>
        </div>
      </main>
    </div>
  );
}
