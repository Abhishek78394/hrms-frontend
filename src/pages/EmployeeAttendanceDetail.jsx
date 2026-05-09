import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertCircle,
  Download,
  Filter,
  User,
  MapPin
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";

export default function EmployeeAttendanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch logs for this employee
        const [logsRes, empRes] = await Promise.all([
          api.get("/attendance", { params: { employeeId: id } }),
          api.get(`/employees/${id}`)
        ]);
        setLogs(logsRes.data.data);
        setEmployee(empRes.data.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const totalMinutes = logs.reduce((acc, log) => acc + (log.workMinutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const stats = {
    present: logs.filter(l => l.status === "present").length,
    late: logs.filter(l => l.status === "late").length,
    avgHours: logs.length > 0 ? (totalMinutes / logs.length / 60).toFixed(1) : 0
  };

  if (loading) return <div className="p-12 text-center font-black text-slate-400 animate-pulse">Loading Employee History...</div>;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance History</h1>
            <p className="text-slate-500 font-medium">Detailed log for {employee?.firstName} {employee?.lastName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} /> Export PDF
          </Button>
          <Button className="flex items-center gap-2">
            <Filter size={18} /> Filter Range
          </Button>
        </div>
      </header>

      {/* Profile Card */}
      <div className="card p-6 bg-white border-none shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-3xl bg-orange-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-orange-100 rotate-3 shrink-0">
          {employee?.firstName?.[0]}{employee?.lastName?.[0]}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-black text-slate-900">{employee?.firstName} {employee?.lastName}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Badge icon={User} label={employee?.designation} />
            <Badge icon={MapPin} label={employee?.department} />
            <Badge icon={Calendar} label={`Joined ${new Date(employee?.joiningDate).toLocaleDateString()}`} />
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1 px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Working Time</p>
          <p className="text-3xl font-black text-slate-900">{totalHours}h {remainingMinutes}m</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Days Present" value={stats.present} icon={UserCheck} color="emerald" />
        <StatCard label="Late Arrivals" value={stats.late} icon={AlertCircle} color="amber" />
        <StatCard label="Avg. Hours/Day" value={`${stats.avgHours}h`} icon={Clock} color="blue" />
      </div>

      <div className="card overflow-hidden bg-white shadow-xl shadow-slate-200/40 border-none">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900">Historical Records</h3>
           <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest">
             {logs.length} Total Logs
           </span>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/30 transition-colors group">
                       <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-600">
                         {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-600">
                         {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-600">
                         {log.workMinutes ? `${Math.floor(log.workMinutes / 60)}h ${log.workMinutes % 60}m` : "-"}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            log.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                             {log.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
      <Icon size={14} className="text-slate-400" />
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-500 shadow-emerald-100 text-white",
    blue: "bg-blue-500 shadow-blue-100 text-white",
    rose: "bg-rose-500 shadow-rose-100 text-white",
    amber: "bg-amber-500 shadow-amber-100 text-white"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card p-6 flex items-center gap-6 bg-white border-none shadow-xl shadow-slate-200/50"
    >
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${colors[color]}`}>
          <Icon size={24} strokeWidth={2.5} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
       </div>
    </motion.div>
  );
}
