import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import "./ProductivityChart.css";

export default function ProductivityChart({ data }) {
  return (
    <div className="chart-card">
      <h4>Weekly Productivity</h4>

      <LineChart width={360} height={220} data={data}>
        <XAxis dataKey="reportDate" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="productivityScore"
          stroke="#4f46e5"
        />
      </LineChart>
    </div>
  );
}
