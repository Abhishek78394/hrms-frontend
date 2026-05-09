import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Play,
  Square
} from "lucide-react";
import axios from "axios";
import Button from "../components/ui/Button";

export default function AttendancePage() {
  const user = useSelector((s) => s.auth.user);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // Current today's status

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/attendance");
      setLogs(res.data.data);
      const today = new Date().toISOString().split("T")[0];
      const todayLog = res.data.data.find(l => l.date === today);
      setStatus(todayLog);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/v1/attendance/check-in", { 
        employeeId: user?.employeeId || "645a1b..." // This should be the real employee ID
      });
      fetchLogs();
    } catch (e) {
      alert(e.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/v1/attendance/check-out", { 
        employeeId: user?.employeeId 
      });
      fetchLogs();
    } catch (e) {
      alert(e.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Attendance Management</h1>
        <p className="text-sm font-bold text-slate-400">{new Date().toDateString()}</p>
      </div>

      {/* Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4 ring-8 ring-brand-50/50">
            <Clock size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Daily Attendance</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8">Mark your attendance for today. Please ensure your location is enabled.</p>
          
          {!status ? (
            <Button 
              onClick={handleCheckIn} 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              <Play size={20} fill="currentColor" />
              Check In
            </Button>
          ) : !status.checkOut ? (
            <Button 
              onClick={handleCheckOut} 
              disabled={loading}
              variant="danger"
              className="w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              <Square size={20} fill="currentColor" />
              Check Out
            </Button>
          ) : (
            <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-100">
              <UserCheck size={20} />
              Attendance Completed
            </div>
          )}

          {status && (
            <div className="mt-6 grid grid-cols-2 gap-4 w-full pt-6 border-t border-slate-50">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Time</p>
                  <p className="text-sm font-black text-slate-700">{new Date(status.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Out Time</p>
                  <p className="text-sm font-black text-slate-700">{status.checkOut ? new Date(status.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</p>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-3 gap-6">
              <MiniStat label="Total Present" value="24 Days" icon={UserCheck} color="text-emerald-500 bg-emerald-50" />
              <MiniStat label="Late Arrivals" value="02 Days" icon={AlertCircle} color="text-amber-500 bg-amber-50" />
              <MiniStat label="Absents" value="01 Day" icon={UserX} color="text-rose-500 bg-rose-50" />
           </div>

           <div className="card overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                 <h3 className="text-lg font-black text-slate-900">Attendance History</h3>
                 <button className="text-xs font-bold text-brand-500 hover:underline">Download PDF</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Hours</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {logs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="px-6 py-4 text-sm font-black text-slate-700">{log.date}</td>
                             <td className="px-6 py-4 text-sm font-medium text-slate-600">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                             <td className="px-6 py-4 text-sm font-medium text-slate-600">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                             <td className="px-6 py-4 text-sm font-medium text-slate-600">{log.workMinutes ? `${Math.floor(log.workMinutes/60)}h ${log.workMinutes%60}m` : "-"}</td>
                             <td className="px-6 py-4 text-right">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${log.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
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
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-4">
       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-slate-900">{value}</p>
       </div>
    </div>
  );
}
