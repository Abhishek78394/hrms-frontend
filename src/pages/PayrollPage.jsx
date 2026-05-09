import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  CreditCard, 
  Download, 
  Eye, 
  CheckCircle, 
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  FileText
} from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function PayrollPage() {
  const { user } = useSelector((s) => s.auth);
  const isAdminOrHR = user?.role === "Admin" || user?.role === "HR";
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll");
      setRecords(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch payroll records");
    } finally {
      setLoading(false);
    }
  };

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [genData, setGenData] = useState({ month: new Date().toISOString().slice(0, 7), employeeId: "", basicSalary: 0, allowances: 0, deductions: 0 });

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayroll();
    if (isAdminOrHR) fetchEmployees();
  }, [isAdminOrHR]);

  const handleBulkGenerate = async () => {
    try {
      await api.post("/payroll", { month: genData.month, isBulk: true });
      toast.success("Bulk payroll generation started");
      setIsBulkModalOpen(false);
      fetchPayroll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate bulk payroll");
    }
  };

  const handleIndividualGenerate = async () => {
    try {
      await api.post("/payroll", { ...genData, isBulk: false });
      toast.success("Payroll generated successfully");
      setIsIndividualModalOpen(false);
      fetchPayroll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate payroll");
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDownload = (record) => {
    toast.success(`Downloading payslip for ${record.month}...`);
    const content = `PAYSLIP - NEXHR\n----------------\nEmployee: ${record.employeeId?.firstName} ${record.employeeId?.lastName}\nMonth: ${record.month}\nBasic Salary: ₹${record.basicSalary}\nAllowances: ₹${record.allowances}\nDeductions: ₹${record.deductions}\nNet Salary: ₹${record.netSalary}\nStatus: ${record.status}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payslip_${record.month}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await api.patch(`/payroll/${id}/status`, { status: "paid", paymentMethod: "Bank Transfer" });
      toast.success("Payroll marked as paid");
      fetchPayroll();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const stats = {
    totalPaid: records.filter(r => r.status === "paid").reduce((acc, r) => acc + r.netSalary, 0),
    pending: records.filter(r => r.status === "pending").length,
    totalDeductions: records.reduce((acc, r) => acc + (r.deductions || 0), 0)
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAdminOrHR ? "Payroll Management" : "My Payslips & Salary"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdminOrHR ? "Manage employee salaries and payments." : "View your salary summary and download payslips."}
          </p>
        </div>
        
        {isAdminOrHR && (
          <div className="flex gap-3">
            <Button 
              variant="secondary"
              onClick={() => setIsBulkModalOpen(true)} 
              className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-sm"
            >
               <TrendingUp size={18} className="text-emerald-500" /> Bulk Generate
            </Button>
            <Button onClick={() => setIsIndividualModalOpen(true)} className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-brand-100">
               <Plus size={20} strokeWidth={3} /> Individual Generate
            </Button>
          </div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={isAdminOrHR ? "Total Disbursed" : "Last Salary"} 
          value={isAdminOrHR ? `₹${stats.totalPaid.toLocaleString()}` : (records[0] ? `₹${records[0].netSalary.toLocaleString()}` : "₹0")} 
          icon={DollarSign} 
          color="emerald" 
        />
        <StatCard 
          label={isAdminOrHR ? "Pending Payments" : "Total Earnings (Year)"} 
          value={isAdminOrHR ? stats.pending : `₹${records.filter(r => r.status === 'paid').reduce((acc, r) => acc + r.netSalary, 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="blue" 
        />
        <StatCard 
          label={isAdminOrHR ? "Total Deductions" : "Deductions (Last)"} 
          value={`₹${(isAdminOrHR ? stats.totalDeductions : (records[0]?.deductions || 0)).toLocaleString()}`} 
          icon={TrendingDown} 
          color="rose" 
        />
      </div>

      <div className="card overflow-hidden bg-white shadow-xl shadow-slate-200/40 border-none">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                 <CreditCard size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {isAdminOrHR ? "Salary Records" : "Last 6 Months Salary Summary"}
              </h3>
           </div>
           
           <div className="flex items-center gap-3">
              <select className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-black p-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all">
                 <option>Fiscal Year 2026</option>
                 <option>Fiscal Year 2025</option>
              </select>
              {!isAdminOrHR && (
                <button className="p-2.5 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors" title="Export History">
                  <Download size={20} />
                </button>
              )}
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    {isAdminOrHR ? (
                      <>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Working Hours</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Overtime Approved</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Salary</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   [1,2,3].map(i => <SkeletonRow key={i} isAdmin={isAdminOrHR} />)
                 ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={isAdminOrHR ? 7 : 7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText size={48} className="mb-4 opacity-20" />
                          <p className="font-bold">No payroll records found</p>
                        </div>
                      </td>
                    </tr>
                 ) : records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/30 transition-colors group">
                       {isAdminOrHR ? (
                         <>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs">
                                  {r.employeeId?.firstName?.[0]}{r.employeeId?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{r.employeeId?.firstName} {r.employeeId?.lastName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{r.employeeId?.designation}</p>
                                </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.month}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">₹{r.basicSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">+₹{r.allowances.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">₹{r.netSalary.toLocaleString()}</td>
                         </>
                       ) : (
                         <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-700">{new Date(r.month + "-01").toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.totalWorkingHours || 160}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.overtimeHours || 0}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{r.totalHours || 160}</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">${r.netSalary.toLocaleString()}</td>
                         </>
                       )}
                       <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                             {r.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleView(r)} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl" title="View Details"><Eye size={18} /></button>
                             <button onClick={() => handleDownload(r)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl" title="Download PDF"><Download size={18} /></button>
                             {r.status === 'pending' && isAdminOrHR && (
                                <button onClick={() => handleMarkAsPaid(r._id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="Mark as Paid"><CheckCircle size={18} /></button>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Bulk Generate Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-900">Bulk Generation</h3>
                 <button onClick={() => setIsBulkModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Plus size={24} className="rotate-45 text-slate-400" />
                 </button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Month</label>
                    <input 
                      type="month" 
                      value={genData.month}
                      onChange={(e) => setGenData({...genData, month: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 transition-all font-bold"
                    />
                 </div>
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                       This will generate payroll records for ALL active employees who don't already have one for this month. Base salary will be used from their profiles.
                    </p>
                 </div>
                 <Button onClick={handleBulkGenerate} className="w-full py-4 rounded-2xl shadow-lg shadow-emerald-100 bg-emerald-500 hover:bg-emerald-600">
                    Run Bulk Generation
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Individual Generate Modal */}
      {isIndividualModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-900">Individual Payroll</h3>
                 <button onClick={() => setIsIndividualModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Plus size={24} className="rotate-45 text-slate-400" />
                 </button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</label>
                       <input 
                         type="month" 
                         value={genData.month}
                         onChange={(e) => setGenData({...genData, month: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</label>
                       <select 
                         value={genData.employeeId}
                         onChange={(e) => {
                            const emp = employees.find(x => x._id === e.target.value);
                            setGenData({...genData, employeeId: e.target.value, basicSalary: emp?.salary || 0});
                         }}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 font-bold"
                       >
                          <option value="">Select Employee</option>
                          {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic</label>
                       <input 
                         type="number" 
                         value={genData.basicSalary}
                         onChange={(e) => setGenData({...genData, basicSalary: Number(e.target.value)})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</label>
                       <input 
                         type="number" 
                         value={genData.allowances}
                         onChange={(e) => setGenData({...genData, allowances: Number(e.target.value)})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</label>
                       <input 
                         type="number" 
                         value={genData.deductions}
                         onChange={(e) => setGenData({...genData, deductions: Number(e.target.value)})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-500 font-bold"
                       />
                    </div>
                 </div>

                 <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-white">
                    <p className="text-xs font-black uppercase tracking-widest opacity-50">Total Net Salary</p>
                    <p className="text-2xl font-black">₹{(genData.basicSalary + genData.allowances - genData.deductions).toLocaleString()}</p>
                 </div>

                 <Button onClick={handleIndividualGenerate} className="w-full py-4 rounded-2xl shadow-lg shadow-brand-100">
                    Generate Payslip
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Payslip Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
                       <FileText size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Payslip Detail</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedRecord.month}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                    <Plus size={24} className="rotate-45 text-slate-400" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">₹{selectedRecord.netSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-lg">
                          {selectedRecord.status}
                       </span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Earnings</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                             <span className="text-slate-500">Basic</span>
                             <span className="text-slate-900">₹{selectedRecord.basicSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                             <span className="text-slate-500">Allowances</span>
                             <span className="text-emerald-500">+₹{selectedRecord.allowances.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deductions</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                             <span className="text-slate-500">Taxes/Other</span>
                             <span className="text-rose-500">-₹{selectedRecord.deductions.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Employee Information</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black">
                          {selectedRecord.employeeId?.firstName?.[0]}{selectedRecord.employeeId?.lastName?.[0]}
                       </div>
                       <div>
                          <p className="font-black text-slate-900">{selectedRecord.employeeId?.firstName} {selectedRecord.employeeId?.lastName}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase">{selectedRecord.employeeId?.designation} • {selectedRecord.employeeId?.employeeId}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                 <Button onClick={() => handleDownload(selectedRecord)} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl">
                    <Download size={20} /> Download PDF
                 </Button>
              </div>
           </div>
        </div>
      )}
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

function SkeletonRow({ isAdmin }) {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-16 ml-auto"></div></td>
    </tr>
  );
}

