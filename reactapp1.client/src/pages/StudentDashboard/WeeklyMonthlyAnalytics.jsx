import { useEffect, useState } from "react";
import { getWeeklyAnalytics, getMonthlyAnalytics } from "../../services/studentApi";
import { FaCalendarWeek, FaCalendarAlt, FaBookOpen, FaTasks, FaChartLine, FaTrophy } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./Analytics.css";

/* ─── Mock data for chart to make UI "premium" ───────── */
const mockChartData = [
  { group: "Study (hrs)", Weekly: 8.5, Monthly: 34.2 },
  { group: "Tasks Done", Weekly: 14, Monthly: 48 },
  { group: "Productivity", Weekly: 76, Monthly: 82 },
];

export default function WeeklyMonthlyAnalytics() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWeeklyAnalytics(), getMonthlyAnalytics()])
      .then(([wRes, mRes]) => {
        setWeekly(wRes);
        setMonthly(mRes);
        setLoading(false);
      });
  }, []);

  if (loading || !weekly || !monthly) return (
    <div className="an-loading">
      <div className="an-spinner" />
      <p>Loading your analytics…</p>
    </div>
  );

  return (
    <div className="an">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="an-header">
        <div>
          <h1 className="an-title">Performance Analytics</h1>
          <p className="an-subtitle">Track your long-term study habits and productivity</p>
        </div>
      </div>

      <div className="an-content">
        
        {/* ── KPI GRID ────────────────────────────────────────────── */}
        <div className="an-grid">
          
          {/* WEEKLY */}
          <div className="an-card an-card--weekly">
            <div className="an-card-header">
              <div className="an-card-icon an-card-icon--indigo"><FaCalendarWeek /></div>
              <h3 className="an-card-title">This Week</h3>
            </div>
            
            <div className="an-stats-list">
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaBookOpen className="an-stat-ico" />
                  <span>Study Time</span>
                </div>
                <div className="an-stat-right">
                  <strong>{weekly.totalStudyMinutes}</strong> mins
                </div>
              </div>
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaTasks className="an-stat-ico" />
                  <span>Tasks Completed</span>
                </div>
                <div className="an-stat-right">
                  <strong>{weekly.totalCompletedTasks}</strong> tasks
                </div>
              </div>
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaChartLine className="an-stat-ico" />
                  <span>Productivity</span>
                </div>
                <div className="an-stat-right">
                  <strong>{weekly.averageProductivityScore.toFixed(1)}</strong> %
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY */}
          <div className="an-card an-card--monthly">
            <div className="an-card-header">
              <div className="an-card-icon an-card-icon--emerald"><FaCalendarAlt /></div>
              <h3 className="an-card-title">This Month</h3>
            </div>
            
            <div className="an-stats-list">
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaBookOpen className="an-stat-ico" />
                  <span>Study Time</span>
                </div>
                <div className="an-stat-right">
                  <strong>{monthly.totalStudyMinutes}</strong> mins
                </div>
              </div>
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaTasks className="an-stat-ico" />
                  <span>Tasks Completed</span>
                </div>
                <div className="an-stat-right">
                  <strong>{monthly.totalCompletedTasks}</strong> tasks
                </div>
              </div>
              <div className="an-stat-item">
                <div className="an-stat-left">
                  <FaChartLine className="an-stat-ico" />
                  <span>Productivity</span>
                </div>
                <div className="an-stat-right">
                  <strong>{monthly.averageProductivityScore.toFixed(1)}</strong> %
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── VISUAL CHART ────────────────────────────────────────── */}
        <div className="an-card an-card--chart">
          <div className="an-chart-header">
            <div className="an-card-icon an-card-icon--rose"><FaTrophy /></div>
            <div>
              <h3 className="an-card-title">Overall Metrics Overview</h3>
              <p className="an-card-subtitle">Visual representation of your milestones</p>
            </div>
          </div>
          
          <div className="an-chart-area">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dx={-10} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Weekly" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Monthly" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
