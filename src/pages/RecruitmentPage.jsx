import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  ChevronRight,
  MoreVertical,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  FileText,
  UserCheck,
  TrendingUp,
  X
} from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" or "candidates"

  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [jobFormData, setJobFormData] = useState({
    title: "",
    department: "",
    location: "Remote",
    type: "Full-time",
    experience: "",
    description: "",
    requirements: [""],
    salaryRange: { min: 0, max: 0 }
  });

  const [candidateFormData, setCandidateFormData] = useState({
    jobId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "Manual",
    resumeUrl: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, candRes, statsRes] = await Promise.all([
        api.get("/recruitment/jobs"),
        api.get("/recruitment/candidates"),
        api.get("/recruitment/stats")
      ]);
      setJobs(jobsRes.data.data);
      setCandidates(candRes.data.data);
      setStats(statsRes.data.data);
    } catch (e) {
      toast.error("Failed to fetch recruitment data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/recruitment/apply", candidateFormData);
      toast.success("Candidate added successfully!");
      setIsCandidateModalOpen(false);
      setCandidateFormData({
        jobId: "", firstName: "", lastName: "", email: "", phone: "", source: "Manual", resumeUrl: ""
      });
      fetchData();
    } catch (err) {
      toast.error("Failed to add candidate");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/recruitment/jobs/${id}`);
      toast.success("Job deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await api.delete(`/recruitment/candidates/${id}`);
      toast.success("Candidate deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete candidate");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jobFormData,
        requirements: jobFormData.requirements.filter(r => r.trim())
      };
      await api.post("/recruitment/jobs", payload);
      toast.success("Job posted successfully!");
      setIsJobModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to post job");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/recruitment/candidates/${id}/status`, { status });
      toast.success(`Candidate status updated to ${status}`);
      fetchData();
      if (selectedCandidate?._id === id) setSelectedCandidate(null);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruitment Management</h1>
          <p className="text-slate-500 font-medium">Manage job postings and track candidate applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsJobModalOpen(true)} className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-brand-100 bg-brand-500 hover:bg-brand-600">
             <Plus size={20} strokeWidth={3} /> Post Job
          </Button>
          <Button onClick={() => setIsCandidateModalOpen(true)} className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-slate-100 bg-slate-900 hover:bg-slate-800">
             <Users size={20} strokeWidth={3} /> Add Candidate
          </Button>
        </div>
      </header>

      {/* Recruitment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <JobStat label="Active Openings" count={stats?.totalJobs || 0} icon={Briefcase} color="bg-brand-500" />
        <JobStat label="Total Applicants" count={stats?.totalCandidates || 0} icon={Users} color="bg-blue-500" />
        <JobStat label="Total Hired" count={stats?.hiredCount || 0} icon={UserCheck} color="bg-emerald-500" />
        <JobStat label="Avg Response" count="24h" icon={Clock} color="bg-amber-500" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("jobs")}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'jobs' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Job Openings
          {activeTab === 'jobs' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("candidates")}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'candidates' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Candidate Tracker
          {activeTab === 'candidates' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {activeTab === "jobs" ? (
              <div className="space-y-4">
                 {jobs.map((job) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={job._id} 
                      className="card p-6 flex items-center justify-between group hover:border-brand-200 transition-all bg-white"
                    >
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-inner">
                             <Briefcase size={28} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-500 transition-colors">{job.title}</h3>
                             <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded"><MapPin size={12} className="text-brand-500" /> {job.location}</span>
                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded"><Clock size={12} className="text-amber-500" /> {job.type}</span>
                                <span className="text-emerald-600 font-black">₹{job.salaryRange?.min} - ₹{job.salaryRange?.max}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-center">
                             <p className="text-lg font-black text-slate-900">{candidates.filter(c => c.jobId?._id === job._id).length}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                             <X size={20} />
                          </button>
                          <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-50 hover:text-brand-500 transition-all">
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
            ) : (
              <div className="space-y-4">
                 {candidates.map((cand) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={cand._id} 
                      onClick={() => setSelectedCandidate(cand)}
                      className="card p-6 flex items-center justify-between group hover:border-brand-200 transition-all cursor-pointer bg-white"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-inner uppercase">
                             {cand.firstName[0]}{cand.lastName[0]}
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-slate-900">{cand.firstName} {cand.lastName}</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Applied for: <span className="text-brand-500">{cand.jobId?.title}</span></p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            cand.status === 'Hired' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            cand.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                             {cand.status}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCandidate(cand._id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                             <XCircle size={18} />
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
            )}
         </div>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {isCandidateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                         <Users size={24} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Add New Candidate</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manually enter applicant details</p>
                      </div>
                   </div>
                   <button onClick={() => setIsCandidateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X size={24} className="text-slate-300" />
                   </button>
                </div>

                <form onSubmit={handleCreateCandidate} className="p-8 space-y-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Job</label>
                      <select 
                        required
                        value={candidateFormData.jobId}
                        onChange={(e) => setCandidateFormData({...candidateFormData, jobId: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                      >
                         <option value="">Select Job Opening</option>
                         {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                      </select>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                         <input 
                           type="text" required
                           value={candidateFormData.firstName}
                           onChange={(e) => setCandidateFormData({...candidateFormData, firstName: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                         <input 
                           type="text" required
                           value={candidateFormData.lastName}
                           onChange={(e) => setCandidateFormData({...candidateFormData, lastName: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                         <input 
                           type="email" required
                           value={candidateFormData.email}
                           onChange={(e) => setCandidateFormData({...candidateFormData, email: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                         <input 
                           type="text" required
                           value={candidateFormData.phone}
                           onChange={(e) => setCandidateFormData({...candidateFormData, phone: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume Link (optional)</label>
                      <input 
                        type="url"
                        value={candidateFormData.resumeUrl}
                        onChange={(e) => setCandidateFormData({...candidateFormData, resumeUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                        placeholder="e.g. https://drive.google.com/..."
                      />
                   </div>

                   <div className="pt-6 flex justify-end gap-4">
                      <button type="button" onClick={() => setIsCandidateModalOpen(false)} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Cancel</button>
                      <Button type="submit" className="px-12 py-4 rounded-2xl shadow-xl shadow-slate-100 font-black tracking-tight bg-slate-900 text-white hover:bg-slate-800">Add Candidate</Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

         <div className="lg:col-span-1 space-y-6">
            <div className="card p-8 bg-slate-900 text-white relative overflow-hidden">
               <TrendingUp size={140} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
               <h3 className="text-2xl font-black mb-1">Active Funnel</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Candidate Pipeline Stats</p>
               
               <div className="space-y-5 relative z-10">
                  {stats?.statusStats?.map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">{stat._id}</span>
                          <span className="text-white">{stat.count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500" style={{ width: `${(stat.count / (stats.totalCandidates || 1)) * 100}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <Button className="w-full mt-10 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl">
                  Download Recruitment Report
               </Button>
            </div>

            <div className="card p-6 bg-white shadow-xl shadow-slate-200/50">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Calendar className="text-brand-500" size={18} /> Upcoming Interviews
               </h3>
               <div className="space-y-6">
                  {candidates.filter(c => c.status === "Interviewing").slice(0, 3).map((cand, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                           <Clock size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <p className="text-sm font-black truncate">{cand.firstName} {cand.lastName}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cand.jobId?.title}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-brand-500 uppercase">Today</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">2:00 PM</p>
                        </div>
                     </div>
                  ))}
                  {candidates.filter(c => c.status === "Interviewing").length === 0 && (
                    <p className="text-xs text-slate-400 font-bold text-center py-4 italic">No interviews scheduled today.</p>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {isJobModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
                         <Plus size={24} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Post New Job Opening</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Create a vacancy in the portal</p>
                      </div>
                   </div>
                   <button onClick={() => setIsJobModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X size={24} className="text-slate-300" />
                   </button>
                </div>

                <form onSubmit={handleCreateJob} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                         <input 
                           type="text" required
                           value={jobFormData.title}
                           onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                           placeholder="e.g. Senior Product Designer"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                         <select 
                           value={jobFormData.department}
                           onChange={(e) => setJobFormData({...jobFormData, department: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                           required
                         >
                            <option value="">Select Department</option>
                            <option>Engineering</option>
                            <option>Design</option>
                            <option>Marketing</option>
                            <option>Sales</option>
                            <option>Human Resources</option>
                         </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                         <input 
                           type="text" required
                           value={jobFormData.location}
                           onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                           placeholder="e.g. Remote or Mumbai, India"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Type</label>
                         <select 
                           value={jobFormData.type}
                           onChange={(e) => setJobFormData({...jobFormData, type: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                         </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Salary (INR)</label>
                         <input 
                           type="number"
                           value={jobFormData.salaryRange.min}
                           onChange={(e) => setJobFormData({...jobFormData, salaryRange: {...jobFormData.salaryRange, min: Number(e.target.value)}})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Salary (INR)</label>
                         <input 
                           type="number"
                           value={jobFormData.salaryRange.max}
                           onChange={(e) => setJobFormData({...jobFormData, salaryRange: {...jobFormData.salaryRange, max: Number(e.target.value)}})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
                      <textarea 
                        required
                        value={jobFormData.description}
                        onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium min-h-[150px] outline-none focus:bg-white focus:border-brand-500 shadow-inner"
                        placeholder="Write detailed responsibilities and role description..."
                      />
                   </div>

                   <div className="pt-6 flex justify-end gap-4">
                      <button type="button" onClick={() => setIsJobModalOpen(false)} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Cancel</button>
                      <Button type="submit" className="px-12 py-4 rounded-2xl shadow-xl shadow-brand-100 font-black tracking-tight">Post Job Opening</Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-100 font-black text-2xl uppercase">
                         {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900">{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedCandidate.jobId?.title} • {selectedCandidate.email}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCandidate(null)} className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                      <X size={28} className="text-slate-300" />
                   </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="md:col-span-2 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                            <p className="text-sm font-black text-slate-700">{selectedCandidate.phone}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                            <p className="text-sm font-black text-slate-700">{selectedCandidate.source}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <FileText className="text-brand-500" size={20} /> Documents
                         </h4>
                         <a 
                           href={selectedCandidate.resumeUrl || "#"} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center justify-between p-6 bg-slate-50 border border-brand-100 rounded-3xl group hover:bg-brand-500 transition-all"
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                                  <FileText size={24} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 group-hover:text-white">Professional Resume.pdf</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-brand-100 tracking-widest">Uploaded on {new Date(selectedCandidate.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <Eye size={20} className="text-slate-300 group-hover:text-white" />
                         </a>
                      </div>
                   </div>

                   <div className="md:col-span-1 space-y-6">
                      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                         <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Update Status</h4>
                         <div className="space-y-3">
                            {["Shortlisted", "Interviewing", "Offered", "Hired", "Rejected"].map(st => (
                               <button 
                                 key={st}
                                 onClick={() => updateStatus(selectedCandidate._id, st)}
                                 className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                   selectedCandidate.status === st 
                                   ? 'bg-brand-500 border-brand-600 text-white shadow-lg shadow-brand-500/20' 
                                   : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                 }`}
                               >
                                  {st}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JobStat({ label, count, icon: Icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card p-6 flex items-center gap-6 bg-white border-none shadow-xl shadow-slate-200/50"
    >
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
          <Icon size={24} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-900">{count}</p>
       </div>
    </motion.div>
  );
}

