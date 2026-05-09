import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import { fetchEmployees, deleteEmployee } from "../features/employees/employeeSlice";
import DataTable from "../components/tables/DataTable";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";

const STATUS_OPTIONS = [
  "Active", "Inactive", "On Leave", "Notice Period", "Resignation", 
  "Termination", "Layoff", "Retirement", "Contract End", "Absconded", 
  "Suspended", "Archived"
];

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const { rows, meta, loading } = useSelector((s) => s.employees);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [designation, setDesignation] = useState("");
  const [sort, setSort] = useState("-createdAt");
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 10, search, status, designation, sort }));
  }, [dispatch, search, status, designation, sort]);

  const handleDeleteClick = (id) => {
    setSelectedEmployeeId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEmployeeId) {
      const res = await dispatch(deleteEmployee(selectedEmployeeId));
      if (!res.error) {
        toast.success("Employee record deleted successfully.");
      } else {
        toast.error("Failed to delete employee record.");
      }
      setIsDeleteModalOpen(false);
      setSelectedEmployeeId(null);
    }
  };

  const columns = [
    { 
      key: "employeeId", 
      label: "Emp ID", 
      render: (r) => <span className="text-orange-500 font-bold uppercase tracking-tighter">{r.employeeId}</span>
    },
    { 
      key: "name", 
      label: "Name", 
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-slate-50 shrink-0">
             <img src={r.profileImage || `https://ui-avatars.com/api/?name=${r.firstName}+${r.lastName}&background=f1f5f9&color=475569`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 leading-none truncate">{r.firstName} {r.lastName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{r.designation}</p>
          </div>
        </div>
      )
    },
    { key: "email", label: "Email", render: (r) => <span className="text-slate-600 font-medium truncate max-w-[150px] block">{r.email}</span> },
    { key: "designation", label: "Designation", render: (r) => <span className="text-slate-600 font-bold">{r.designation}</span> },
    { key: "joiningDate", label: "Joining Date", render: (r) => <span className="text-slate-500 font-medium">{r.joiningDate ? new Date(r.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</span> },
    { 
      key: "status", 
      label: "Status", 
      render: (r) => {
        const s = r.status || "Active";
        const colors = {
          Active: "bg-emerald-500",
          Inactive: "bg-slate-400",
          "On Leave": "bg-blue-400",
          "Notice Period": "bg-yellow-500",
          Resignation: "bg-orange-500",
          Termination: "bg-rose-500",
          Layoff: "bg-purple-500",
          Retirement: "bg-sky-500",
          "Contract End": "bg-amber-500",
          Absconded: "bg-slate-900",
          Suspended: "bg-rose-700",
          Archived: "bg-slate-500"
        };
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-100 bg-white shadow-sm w-fit whitespace-nowrap">
            <div className={`w-2 h-2 rounded-full ${colors[s] || "bg-slate-300"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{s}</span>
          </div>
        );
      }
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Link to={"/employees/" + r._id + "/edit"} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
            <Edit size={18} />
          </Link>
          <button onClick={() => handleDeleteClick(r._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      ) 
    }
  ];

  const total = meta.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <Link to="/" className="hover:text-orange-500 uppercase tracking-widest">Dashboard</Link>
              <ChevronDown size={10} className="-rotate-90" />
              <span className="text-slate-900 font-black uppercase tracking-widest">Employee List</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900">Employee</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/employees/new">
            <Button className="flex items-center gap-2 py-2.5 px-6 font-black shadow-xl shadow-orange-100 rounded-xl">
              <Plus size={20} /> Add Employee
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EmployeeKpi label="Total Employees" count={total} percentage="+100%" icon={Users} color="bg-slate-900" />
        <EmployeeKpi label="Active Employees" count={rows.filter(r => r.status === 'Active').length} percentage="Current" icon={UserCheck} color="bg-emerald-500" />
        <EmployeeKpi label="Exited/Other" count={rows.filter(r => !['Active', 'Inactive', 'On Leave'].includes(r.status)).length} percentage="Current" icon={UserX} color="bg-rose-500" />
        <EmployeeKpi label="On Leave" count={rows.filter(r => r.status === 'On Leave').length} percentage="Live" icon={CalendarIcon} color="bg-blue-500" />
      </div>

      <div className="card border-none shadow-smarthr">
        <div className="p-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
           <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                 <input className="pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-700 bg-white min-w-[140px] outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500" placeholder="Filter Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                 <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>

              <div className="relative group">
                 <select className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-700 bg-white min-w-[140px]" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                 </select>
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors" />
              </div>

              <div className="relative group">
                 <select className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-700 bg-white min-w-[160px]" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="firstName">Name (A-Z)</option>
                    <option value="-firstName">Name (Z-A)</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors" />
              </div>
           </div>

           <div className="relative w-full max-w-sm">
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-5 pr-12 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:bg-white transition-all shadow-inner" 
                placeholder="Search employees..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 {search && (
                   <button onClick={() => setSearch("")} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={14} />
                   </button>
                 )}
                 <Search size={16} className="text-slate-400" />
              </div>
           </div>
        </div>
        <DataTable columns={columns} rows={rows} empty={loading ? "Synchronizing database..." : "No records found matching your criteria"} />
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone and will remove all associated data."
        confirmText="Delete Now"
        cancelText="Keep Employee"
        type="danger"
      />
    </div>
  );
}

function EmployeeKpi({ label, count, percentage, icon: Icon, color }) {
  return (
    <div className="card p-5 flex items-center gap-5 group hover:border-orange-200 transition-all cursor-default">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${color} transition-transform`}>
          <Icon size={24} />
       </div>
       <div className="flex-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none mb-2">{label}</p>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-black text-slate-900">{count}</span>
             <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 uppercase tracking-tighter">{percentage}</span>
          </div>
       </div>
    </div>
  );
}
