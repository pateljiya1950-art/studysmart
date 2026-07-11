export default function TaskList() {
  const dummyTasks = [
    { id: 1, title: "Read Chapter 4 of Biology Textbook", completed: true  },
    { id: 2, title: "Finish Math Assignment 2",           completed: true  },
    { id: 3, title: "Review History Flashcards",          completed: false },
    { id: 4, title: "Prepare Presentation Slides",        completed: false },
    { id: 5, title: "Draft English Essay",                completed: false },
  ];

  const completedCount = dummyTasks.filter(t => t.completed).length;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(79,70,229,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-semibold text-slate-800 leading-tight">Today's Tasks</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{completedCount} of {dummyTasks.length} completed</p>
        </div>
        <button className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
          View All
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1 mt-3 mb-5 overflow-hidden">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
          style={{ width: `${Math.round((completedCount / dummyTasks.length) * 100)}%` }}
        />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2">
        {dummyTasks.map(task => (
          <label
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            {/* Checkbox */}
            <div className="relative flex items-center pt-0.5 shrink-0">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="peer w-4.5 h-4.5 appearance-none border-2 border-slate-200 rounded-md checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer w-[18px] h-[18px]"
              />
              <svg
                className="absolute inset-0 w-[18px] h-[18px] text-white p-0.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Label */}
            <span className={`text-sm leading-snug select-none transition-colors ${
              task.completed
                ? 'text-slate-400 line-through'
                : 'text-slate-700 font-medium group-hover:text-slate-900'
            }`}>
              {task.title}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
