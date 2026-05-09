import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Users, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Plus,
  ArrowRight,
  Clock,
  HandIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import Button from "../components/ui/Button";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { stats, loading } = useSelector((s) => s.dashboard);
  const role = user?.role || "Employee";

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Admin/HR KPIs
  const adminKpis = [
    { label: "Total Employees", value: stats?.employees || 0, icon: Users, color: "bg-orange-500 shadow-orange-100" },
    { label: "Attendance Summary", value: stats?.attendance || "94%", icon: Calendar, color: "bg-teal-500 shadow-teal-100" },
    { label: "Pending Payroll", value: stats?.payroll || "₹1.24L", icon: DollarSign, color: "bg-blue-500 shadow-blue-100" },
    { label: "Open Jobs", value: stats?.performance || 4, icon: Briefcase, color: "bg-pink-500 shadow-pink-100" },
  ];

  const employeeKpis = [
    { label: "My Attendance", value: stats?.myAttendance || "100%", icon: Calendar, color: "bg-emerald-500 shadow-emerald-100" },
    { label: "Leave Balance", value: stats?.leaveBalance || "24 Days", icon: HandIcon, color: "bg-orange-500 shadow-orange-100" },
    { label: "Upcoming Reviews", value: stats?.upcomingReviews || "0", icon: Briefcase, color: "bg-indigo-500 shadow-indigo-100" },
    { label: "My Payslips", value: stats?.myPayslips || "N/A", icon: DollarSign, color: "bg-blue-500 shadow-blue-100" },
  ];

  const currentKpis = (role === "Admin" || role === "HR") ? adminKpis : employeeKpis;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="card p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center border-2 border-white shadow-xl overflow-hidden">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=f97316&color=fff&size=128`} 
              alt="Profile" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              Welcome back, {user?.fullName?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {role} Dashboard • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentKpis.map((kpi, i) => (
          <StatCard 
            key={i} 
            {...kpi} 
            link={
              kpi.label === "My Payslips" ? "View My Details" : 
              kpi.label === "My Performance" ? "View History" : 
              role === "Employee" ? "View My Details" : "Manage Module"
            } 
            to={
              kpi.label === "My Payslips" ? "/ess/payslips" :
              kpi.label === "My Performance" ? "/performance" :
              kpi.label === "My Attendance" ? "/ess/attendance" :
              kpi.label === "Leave Balance" ? "/ess/leave" : "#"
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card h-[400px]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-900">
                 {role === "Employee" ? "Recent Activity" : "Employee Attendance Overview"}
               </h3>
               <button className="text-xs font-black text-orange-600 hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-300">
               <Clock size={48} className="opacity-10 mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest opacity-30">Real-time stats loading...</p>
            </div>
          </div>
        </div>

        {/* Sidebar/Quick Actions */}
        <div className="space-y-8">
           <div className="card p-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Quick Notifications</h3>
              <div className="space-y-4">
                 <NotificationItem 
                    icon={CheckCircle2} 
                    color="text-emerald-500" 
                    bg="bg-emerald-50" 
                    title="Profile Updated" 
                    time="2 hours ago" 
                 />
                 <NotificationItem 
                    icon={AlertCircle} 
                    color="text-orange-500" 
                    bg="bg-orange-50" 
                    title="Leave Requested" 
                    time="5 hours ago" 
                 />
              </div>
           </div>

           <div className="card p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
              <h3 className="text-xl font-black mb-2 italic">NexHR Pro</h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6">Experience the future of enterprise resource management with our advanced analytics.</p>
              <button className="w-full py-3 bg-[#f97316] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 hover:scale-105 transition-transform">
                Explore Analytics
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, link, to = "#" }) {
  return (
    <Link to={to} className="card p-6 flex flex-col group cursor-pointer hover:border-orange-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${color} transition-transform group-hover:scale-110`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
           <ArrowRight size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 leading-none">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      <div className="mt-5 pt-5 border-t border-slate-50">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-600 transition-colors">{link}</span>
      </div>
    </Link>
  );
}

function NotificationItem({ icon: Icon, color, bg, title, time }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
       <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{time}</p>
       </div>
    </div>
  );
}
