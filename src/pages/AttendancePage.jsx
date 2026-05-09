import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Search, 
  Users, 
  Download,
  Info,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { ROLES } from "../constants/roles";
import { toast } from "react-hot-toast";

export default function AttendancePage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const isAdminOrHR = user?.role === ROLES.ADMIN || user?.role === ROLES.HR;
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize filterDate to today
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlyStatsMap, setMonthlyStatsMap] = useState({});

  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = isAdminOrHR ? { date: filterDate } : {};
      const res = await api.get("/attendance", { params });
      const data = res.data.data;
      setLogs(data);
      
      const today = new Date().toISOString().split("T")[0];
      if (!isAdminOrHR) {
        const myLog = data.find(l => l.date === today);
        setTodayStatus(myLog);
      } else {
        // Fetch all to aggregate monthly stats
        const allRes = await api.get("/attendance");
        const allLogs = allRes.data.data;
        const stats = {};
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        allLogs.forEach(log => {
          const d = new Date(log.date);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const empId = log.employeeId?._id;
            if (!empId) return;
            if (!stats[empId]) stats[empId] = { days: 0, minutes: 0 };
            if (log.status === "present" || log.status === "late") {
              stats[empId].days += 1;
              stats[empId].minutes += (log.workMinutes || 0);
            }
          }
        });
        setMonthlyStatsMap(stats);
      }
    } catch (e) {
      console.error(e);
      if (e.response?.status === 404 && !isAdminOrHR) {
        setLogs([]);
        setTodayStatus(null);
      } else {
        toast.error("Failed to fetch attendance logs");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [filterDate, isAdminOrHR]);

  const getWorkHours = (checkIn, checkOut, workMinutes) => {
    if (workMinutes) {
      return `${Math.floor(workMinutes / 60)}h ${workMinutes % 60}m`;
    }
    if (checkIn && !checkOut) {
      const start = new Date(checkIn);
      const diff = Math.floor((currentTime - start) / (1000 * 60));
      if (diff < 0) return "0h 0m";
      return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    }
    return "-";
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/check-in");
      toast.success("Checked in successfully");
      fetchAttendance();
    } catch (e) {
      toast.error(e.response?.data?.message || "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/check-out");
      toast.success("Checked out successfully");
      fetchAttendance();
    } catch (e) {
      toast.error(e.response?.data?.message || "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params = isAdminOrHR ? { date: filterDate } : {};
      const res = await api.get("/attendance/export", { 
        params,
        responseType: "blob" 
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started");
    } catch (e) {
      toast.error("Failed to export data");
    }
  };


  const filteredLogs = logs.filter(log => {
    const emp = log.employeeId;
    if (!emp) return false;
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const eId = (emp.employeeId || "").toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || eId.includes(searchTerm.toLowerCase());
  });

  const totalMinutesMonth = logs.reduce((acc, log) => {
    const d = new Date(log.date);
    const now = new Date();
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return acc + (log.workMinutes || 0);
    }
    return acc;
  }, 0);

  const stats = {
    present: logs.filter(l => l.status === "present").length,
    late: logs.filter(l => l.status === "late").length,
    absent: logs.filter(l => l.status === "absent").length,
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-slate-500 font-medium">Track daily attendance and work hours.</p>
        </div>
        
        {/* Only show date picker for Admin/HR */}
        {isAdminOrHR ? (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <Calendar className="text-orange-600" size={18} />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200 cursor-not-allowed">
            <Calendar className="text-slate-400" size={18} />
            <span className="text-sm font-bold text-slate-500">
              Today: {new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={isAdminOrHR ? "Present Today" : "Present This Month"} 
          value={isAdminOrHR ? stats.present : (logs.filter(l => {
            const d = new Date(l.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && l.status === "present";
          }).length + " Days")} 
          icon={UserCheck} 
          color="emerald" 
        />
        <StatCard 
          label={isAdminOrHR ? "Late Arrivals" : "Total Work Hours (Month)"} 
          value={isAdminOrHR ? stats.late : `${Math.floor(totalMinutesMonth/60)}h ${totalMinutesMonth%60}m`} 
          icon={Clock} 
          color="amber" 
        />
        <StatCard 
          label={isAdminOrHR ? "On Leave" : "Current Date"} 
          value={isAdminOrHR ? "02" : new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} 
          icon={Calendar} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Attendance Action Section (Left for Employees) */}
        {!isAdminOrHR && (
          <div className="lg:col-span-4 sticky top-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-8 bg-gradient-to-br from-white to-slate-50 border-orange-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-orange-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-orange-100 rotate-3">
                  <Clock size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Mark Attendance</h2>
                <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
                  Ready to start? Please ensure you are at your designated location.
                </p>

                <AnimatePresence mode="wait">
                  {!todayStatus ? (
                    <motion.div key="check-in" className="w-full">
                      <Button 
                        onClick={handleCheckIn} 
                        disabled={actionLoading}
                        className="w-full py-4 text-lg font-black rounded-2xl"
                      >
                        {actionLoading ? "Processing..." : "Check In Now"}
                      </Button>
                    </motion.div>
                  ) : !todayStatus.checkOut ? (
                    <motion.div key="check-out" className="w-full">
                      <Button 
                        onClick={handleCheckOut} 
                        disabled={actionLoading}
                        variant="danger"
                        className="w-full py-4 text-lg font-black rounded-2xl"
                      >
                        {actionLoading ? "Processing..." : "Check Out"}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="completed" className="w-full p-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-emerald-100">
                      <UserCheck size={24} />
                      Duty Completed
                    </motion.div>
                  )}
                </AnimatePresence>

                {todayStatus && (
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Time</p>
                      <p className="text-lg font-black text-slate-800">{new Date(todayStatus.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-left border-l border-slate-100 pl-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Out Time</p>
                      <p className="text-lg font-black text-slate-800">{todayStatus.checkOut ? new Date(todayStatus.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
              <Info size={20} className="shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                Your records are visible to HR and Management.
              </p>
            </div>
          </div>
        )}

        {/* Attendance List (Right or Full Width for Admin) */}
        <div className={isAdminOrHR ? "lg:col-span-12" : "lg:col-span-8"}>
          <div className="card overflow-hidden bg-white shadow-xl shadow-slate-200/40 border-none">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Users size={20} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900">{isAdminOrHR ? "Employees Attendance" : "Monthly Attendance Logs"}</h3>
              </div>

              
              <div className="flex items-center gap-2">
                 {isAdminOrHR && (
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search employee..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-600/20 w-full md:w-64 outline-none"
                      />
                   </div>
                 )}
                 <button 
                   onClick={handleDownload}
                   className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500" 
                   title="Download Report"
                 >
                    <Download size={20} />
                 </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black text-slate-400">Loading records...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      {isAdminOrHR && <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Employee</th>}
                      {!isAdminOrHR && <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>}
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                      {isAdminOrHR && (
                        <>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Worked Days (Month)</th>
                          <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Worked Hours (Month)</th>
                        </>
                      )}
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Work Hours</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Working Hours</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map((log) => (
                      <tr 
                        key={log._id} 
                        className={`transition-all duration-200 group ${
                          isAdminOrHR ? 'cursor-pointer hover:bg-orange-50/50' : 'hover:bg-slate-50/50'
                        }`}
                        onClick={() => isAdminOrHR && navigate(`/attendance/employee/${log.employeeId?._id}`)}
                      >
                        {isAdminOrHR && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xs group-hover:scale-110 transition-transform">
                                {log.employeeId?.firstName?.[0]}{log.employeeId?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{log.employeeId?.firstName} {log.employeeId?.lastName}</p>
                                <p className="text-[10px] font-bold text-slate-400">{log.employeeId?.employeeId} • {log.employeeId?.department}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        {!isAdminOrHR && (
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-slate-700">
                              {new Date(log.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                        </td>
                        {isAdminOrHR && (
                          <>
                            <td className="px-6 py-4 text-sm font-black text-slate-700">
                              {monthlyStatsMap[log.employeeId?._id]?.days || 0} Days
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-slate-700">
                              {Math.floor((monthlyStatsMap[log.employeeId?._id]?.minutes || 0) / 60)}h {(monthlyStatsMap[log.employeeId?._id]?.minutes || 0) % 60}m
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {log.workMinutes ? `${Math.floor(log.workMinutes / 60)}h ${log.workMinutes % 60}m` : "-"}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-sm font-black ${!log.checkOut ? 'text-orange-600 animate-pulse' : 'text-slate-600'}`}>
                             {getWorkHours(log.checkIn, log.checkOut, log.workMinutes)}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            log.status === "present" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                          }`}>
                            <div className={`w-1 h-1 rounded-full ${log.status === "present" ? "bg-emerald-600" : "bg-rose-600"}`}></div>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                      <Search size={32} />
                   </div>
                   <h4 className="text-lg font-black text-slate-900">No records found</h4>
                   <p className="text-sm text-slate-500 mt-1">No attendance logs available for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="card p-6 flex items-center gap-6"
    >
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ring-4 ${colors[color]}`}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
       </div>
    </motion.div>
  );
}

