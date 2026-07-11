import "./Card.css";

export default function Card({ children, className = "", noPadding = false, ...props }) {
  return (
    <div 
      className={`app-card ${noPadding ? "no-padding" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
