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
  TrendingDown
} from "lucide-react";
import axios from "axios";
import Button from "../components/ui/Button";

export default function PayrollPage() {
  const user = useSelector((s) => s.auth.user);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayroll = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/payroll");
      setRecords(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Payroll Management</h1>
        <Button className="flex items-center gap-2">
           <Plus size={18} /> Generate Payroll
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total Net Salary" value="$45,200" icon={DollarSign} color="bg-emerald-500" />
        <SummaryCard label="Total Allowances" value="$5,400" icon={TrendingUp} color="bg-blue-500" />
        <SummaryCard label="Total Deductions" value="$1,200" icon={TrendingDown} color="bg-rose-500" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
           <h3 className="text-lg font-black text-slate-900">Employee Salary Records</h3>
           <div className="flex items-center gap-3">
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 outline-none">
                 <option>All Months</option>
                 <option>May 2026</option>
                 <option>April 2026</option>
              </select>
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/30 transition-colors">
                       <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-700">{r.employeeId?.firstName} {r.employeeId?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{r.employeeId?.designation}</p>
                       </td>
                       <td className="px-6 py-4 text-sm font-medium text-slate-600">{r.month}</td>
                       <td className="px-6 py-4 text-sm font-medium text-slate-600">${r.basicSalary.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm font-medium text-emerald-600">+${r.allowances.toLocaleString()}</td>
                       <td className="px-6 py-4 text-sm font-black text-slate-900">${r.netSalary.toLocaleString()}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                             {r.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg" title="View Payslip"><Eye size={18} /></button>
                             <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Download"><Download size={18} /></button>
                             {r.status === 'pending' && user?.role === 'Admin' && (
                                <button className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Mark as Paid"><CheckCircle size={18} /></button>
                             )}
                          </div>
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

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-6 flex items-center gap-6 group hover:border-brand-100 transition-colors">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
          <Icon size={24} strokeWidth={2.5} />
       </div>
       <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
       </div>
    </div>
  );
}
