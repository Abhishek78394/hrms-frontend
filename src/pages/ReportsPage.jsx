import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Cell
} from "recharts";

const data = [
  { name: "Jan", employees: 400, recruitment: 240, performance: 240 },
  { name: "Feb", employees: 300, recruitment: 139, performance: 221 },
  { name: "Mar", employees: 200, recruitment: 980, performance: 229 },
  { name: "Apr", employees: 278, recruitment: 390, performance: 200 },
  { name: "May", employees: 189, recruitment: 480, performance: 218 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600">
              <Filter size={16} /> Filter
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-100">
              <Download size={16} /> Export Reports
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="card p-6">
            <h3 className="text-lg font-black text-slate-900 mb-6">Growth Analysis</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                     <Bar dataKey="employees" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="card p-6">
            <h3 className="text-lg font-black text-slate-900 mb-6">Recruitment Pipeline</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                     <Line type="monotone" dataKey="recruitment" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ReportLink label="Attendance Report" icon={Calendar} count="2,400 Records" />
         <ReportLink label="Payroll Summary" icon={DollarSign} count="May 2026" />
         <ReportLink label="Performance Reviews" icon={TrendingUp} count="156 Reviews" />
      </div>
    </div>
  );
}

function ReportLink({ label, icon: Icon, count }) {
  return (
    <div className="card p-6 flex items-center justify-between group cursor-pointer hover:border-brand-500 transition-colors">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
             <Icon size={24} />
          </div>
          <div>
             <h4 className="text-sm font-black text-slate-900">{label}</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{count}</p>
          </div>
       </div>
       <Download size={18} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
    </div>
  );
}
