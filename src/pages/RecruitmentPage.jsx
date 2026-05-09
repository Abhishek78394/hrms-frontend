import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  ChevronRight,
  MoreVertical,
  Clock
} from "lucide-react";
import axios from "axios";
import Button from "../components/ui/Button";

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/recruitment");
      setJobs(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Recruitment</h1>
        <Button className="flex items-center gap-2">
           <Plus size={18} /> Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <JobStat label="Total Jobs" count="12" icon={Briefcase} color="bg-brand-500" />
        <JobStat label="Active Jobs" count="08" icon={Clock} color="bg-emerald-500" />
        <JobStat label="Applicants" count="145" icon={Users} color="bg-blue-500" />
        <JobStat label="On Hold" count="02" icon={Clock} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            {jobs.map((job) => (
               <div key={job._id} className="card p-6 flex items-center justify-between group hover:border-brand-200 transition-colors cursor-pointer">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                        <Briefcase size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-500 transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                           <span className="flex items-center gap-1 capitalize"><Clock size={12} /> {job.type}</span>
                           <span className="text-emerald-500">{job.salaryRange || "$40k - $60k"}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="text-right mr-4">
                        <p className="text-sm font-black text-slate-900">{job.applicants?.length || 0}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicants</p>
                     </div>
                     <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            ))}
         </div>

         <div className="lg:col-span-1 card p-6 bg-slate-900 text-white">
            <h3 className="text-xl font-black mb-2">Recent Applicants</h3>
            <p className="text-slate-400 text-xs font-medium mb-8">View and manage latest candidates</p>
            
            <div className="space-y-6">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">AJ</div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black truncate">Applicant Name {i}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Applied for React Developer</p>
                     </div>
                     <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                  </div>
               ))}
            </div>
            
            <button className="w-full mt-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-black hover:bg-white/10 transition-all uppercase tracking-widest">
               View All Applicants
            </button>
         </div>
      </div>
    </div>
  );
}

function JobStat({ label, count, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-4">
       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-slate-900">{count}</p>
       </div>
    </div>
  );
}
