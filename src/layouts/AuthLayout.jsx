import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-50"></div>

      <div className="card w-full max-w-md p-10 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-200 mb-6 ring-8 ring-orange-50">
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">NexHR Portal</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Enterprise Resource Management</p>
        </div>

        <Outlet />

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs font-medium text-slate-400">
            &copy; 2024 HRMS Enterprise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
