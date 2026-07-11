import Sidebar from './Sidebar';


export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
