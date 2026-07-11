import { useEffect, useState } from "react";
import { getStudentProfile, saveStudentProfile } from "../../services/studentApi";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";

const InputField = ({ label, id, type = "text", value, onChange, disabled, required, min, placeholder }) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      min={min}
      placeholder={placeholder}
      className={disabled ? "disabled-input" : ""}
    />
  </div>
);

export default function StudentProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    semester: "",
    university: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const p = await getStudentProfile();
      setFormData({
        name: p?.name || "",
        email: p?.email || "",
        course: p?.course || "",
        semester: p?.semester || "",
        university: p?.university || ""
      });
    } catch (err) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const submit = async e => {
    e.preventDefault();
    
    // Validation Logic
    if (!formData.course.trim()) {
      setError("Course is required.");
      return;
    }
    if (!formData.university.trim()) {
      setError("University is required.");
      return;
    }
    const semesterNum = Number(formData.semester);
    if (!semesterNum || semesterNum <= 0) {
      setError("Semester must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");
      
      await saveStudentProfile({
        name: formData.name,
        email: formData.email,
        course: formData.course,
        semester: semesterNum,
        university: formData.university
      });
      
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-profile-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-profile-page">
      <div className="student-profile-card">
        <div className="profile-header">
          <div className="avatar-placeholder">
            <span className="avatar-initials">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "S"}
            </span>
          </div>
          <h2>Complete Your Profile</h2>
          <p className="profile-subtitle">Help us personalize your StudySmart experience</p>
        </div>
        
        {error && <div className="alert-error">{error}</div>}
        {successMessage && <div className="alert-success">{successMessage}</div>}
        
        <form onSubmit={submit} className="student-profile-form">
          <InputField 
            label="Full Name" 
            id="name" 
            value={formData.name} 
            disabled 
          />
          
          <InputField 
            label="Email Address" 
            id="email" 
            type="email" 
            value={formData.email} 
            disabled 
          />
          
          <InputField 
            label="University" 
            id="university" 
            placeholder="e.g. Stanford University" 
            value={formData.university} 
            onChange={handleChange} 
            required 
          />
          
          <div className="form-row">
            <InputField 
              label="Course / Major" 
              id="course" 
              placeholder="e.g. Computer Science" 
              value={formData.course} 
              onChange={handleChange} 
              required 
            />
            
            <InputField 
              label="Semester" 
              id="semester" 
              type="number" 
              min="1" 
              placeholder="e.g. 4" 
              value={formData.semester} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/student-dashboard')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
