import { useEffect, useState } from "react";
import { 
  Files, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  Plus
} from "lucide-react";
import axios from "axios";
import Button from "../components/ui/Button";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/documents");
      setDocs(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this document?")) {
      try {
        await axios.delete(`http://localhost:5000/api/v1/documents/${id}`);
        fetchDocs();
      } catch (e) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Document Management</h1>
        <Button className="flex items-center gap-2">
           <Upload size={18} /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <DocTypeCard label="ID Proofs" count="45" icon={File} color="bg-brand-500" />
         <DocTypeCard label="Contracts" count="128" icon={File} color="bg-blue-500" />
         <DocTypeCard label="Payslips" count="1,024" icon={File} color="bg-emerald-500" />
         <DocTypeCard label="Others" count="89" icon={File} color="bg-amber-500" />
      </div>

      <div className="card">
         <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex-1 relative">
               <input 
                 className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-500" 
                 placeholder="Search by title or employee" 
               />
               <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-400 hover:text-slate-600"><Filter size={18} /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {docs.map((doc) => (
                     <tr key={doc._id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                                 <File size={20} />
                              </div>
                              <span className="text-sm font-black text-slate-700">{doc.title}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 capitalize">{doc.type}</td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-700">{doc.employeeId?.firstName} {doc.employeeId?.lastName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg"><Download size={18} /></button>
                              <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
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

function DocTypeCard({ label, count, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-4 hover:border-brand-100 cursor-pointer transition-colors">
       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-lg font-black text-slate-900">{count}</p>
       </div>
    </div>
  );
}
