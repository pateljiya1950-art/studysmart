import {
  LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";
import "./Charts.css";

export default function Charts({ stats }) {
  const lineData = [
    { name: "Tasks", value: stats.completedTasks },
    { name: "Pending", value: stats.pendingTasks }
  ];

  const donutData = [
    { name: "Completed", value: stats.completedTasks },
    { name: "Pending", value: stats.pendingTasks }
  ];

  const COLORS = ["#4f46e5", "#e5e7eb"];

  return (
    <div className="charts">
      <div className="chart-card">
        <h4>Task Progress</h4>
        <LineChart width={350} height={220} data={lineData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" />
        </LineChart>
      </div>

      <div className="chart-card">
        <h4>Completion</h4>
        <PieChart width={250} height={220}>
          <Pie
            data={donutData}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
          >
            {donutData.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
}
