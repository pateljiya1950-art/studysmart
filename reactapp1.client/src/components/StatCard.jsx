import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const iconBg = {
  "text-indigo-500":  "bg-indigo-50  text-indigo-500",
  "text-rose-500":    "bg-rose-50    text-rose-500",
  "text-sky-500":     "bg-sky-50     text-sky-500",
  "text-emerald-500": "bg-emerald-50 text-emerald-500",
};

export default function StatCard({ icon, title, value, trend, positive }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 transition duration-200 hover:shadow-md cursor-default">

      {/* Top: icon + trend */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-lg">
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              positive
                ? "text-emerald-600 bg-emerald-50"
                : "text-rose-500 bg-rose-50"
            }`}
          >
            {positive ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
            {trend}
          </span>
        )}
      </div>

      {/* Value + title */}
      <div>
        <p className="text-xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>

      {/* Footer */}
      {trend && (
        <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          vs last week
        </p>
      )}
    </div>
  );
}
