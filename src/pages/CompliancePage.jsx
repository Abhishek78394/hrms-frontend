import { ShieldCheck, AlertTriangle, FileText, CheckCircle } from "lucide-react";

export default function CompliancePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-slate-900">Compliance Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-6 bg-emerald-50 border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
               <CheckCircle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PF Compliance</p>
               <p className="text-lg font-black text-slate-900">100% Compliant</p>
            </div>
         </div>
         <div className="card p-6 bg-blue-50 border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ESIC Status</p>
               <p className="text-lg font-black text-slate-900">Active</p>
            </div>
         </div>
         <div className="card p-6 bg-amber-50 border-amber-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center">
               <AlertTriangle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Tax Filings</p>
               <p className="text-lg font-black text-slate-900">Pending Q1</p>
            </div>
         </div>
      </div>

      <div className="card p-8">
         <h3 className="text-lg font-black text-slate-900 mb-4">Statutory Compliance Overview</h3>
         <div className="space-y-6">
            <ComplianceItem title="Provident Fund (PF)" desc="Monthly returns and contribution tracking" status="Good" />
            <ComplianceItem title="Professional Tax" desc="State-wise tax deduction and filing" status="Good" />
            <ComplianceItem title="Gratuity Fund" desc="Maintenance of records and eligibility" status="Review" />
         </div>
      </div>
    </div>
  );
}

function ComplianceItem({ title, desc, status }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
       <div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{desc}</p>
       </div>
       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status === 'Good' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{status}</span>
    </div>
  );
}
