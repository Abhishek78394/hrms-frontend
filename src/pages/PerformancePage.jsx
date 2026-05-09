import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  BarChart3, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Award,
  ChevronRight,
  MoreVertical,
  Plus,
  Target,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  X,
  Trophy,
  PieChart
} from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PerformancePage() {
  const { user } = useSelector((s) => s.auth);
  const isAdminOrManager = user?.role === "Admin" || user?.role === "HR" || user?.role === "Manager";

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [ackFeedback, setAckFeedback] = useState("");
  
  const [formData, setFormData] = useState({
    employeeId: "",
    period: new Date().toISOString().slice(0, 7),
    reviewType: "Monthly",
    ratings: {
      workQuality: 5,
      productivity: 5,
      communication: 5,
      teamwork: 5,
      technicalSkills: 5,
      punctuality: 5
    },
    strengths: [""],
    improvements: [""],
    managerFeedback: "",
    goals: [{ title: "", deadline: "" }],
    recommendation: "None"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revRes, empRes] = await Promise.all([
        api.get("/performance"),
        isAdminOrManager ? api.get("/employees?limit=100") : Promise.resolve({ data: { data: [] } })
      ]);
      setReviews(revRes.data.data);
      setEmployees(empRes.data.data);
      
      // Fetch analytics separately to avoid blocking
      api.get("/performance/analytics").then(anaRes => {
        setAnalytics(anaRes.data.data);
      }).catch(err => {
        console.error("Analytics fetch failed:", err);
      });

    } catch (e) {
      toast.error("Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty goals/strengths
      const payload = {
        ...formData,
        strengths: formData.strengths.filter(s => s.trim()),
        improvements: formData.improvements.filter(i => i.trim()),
        goals: formData.goals.filter(g => g.title.trim())
      };
      await api.post("/performance", payload);
      toast.success("Performance review submitted!");
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Management</h1>
          <p className="text-slate-500 font-medium">Monitor employee growth and quality of work.</p>
        </div>
        {isAdminOrManager && (
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-brand-100">
             <Plus size={20} strokeWidth={3} /> Create New Review
          </Button>
        )}
      </header>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-6 bg-white border-none shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
               <Star size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Team Rating</p>
               <p className="text-2xl font-black text-slate-900 mt-1">{analytics?.stats?.[0]?.avgRating?.toFixed(1) || "4.2"}/5.0</p>
            </div>
         </div>
         <div className="card p-6 bg-white border-none shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
               <Trophy size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performer</p>
               <p className="text-lg font-black text-slate-900 mt-1 truncate max-w-[150px]">
                  {analytics?.topPerformers?.[0]?.employeeId?.firstName} {analytics?.topPerformers?.[0]?.employeeId?.lastName || "N/A"}
               </p>
            </div>
         </div>
         <div className="card p-6 bg-white border-none shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
               <Target size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Cycle</p>
               <p className="text-2xl font-black text-slate-900 mt-1">May 2026</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <BarChart3 className="text-brand-500" size={24} />
                 {isAdminOrManager ? "Recent Evaluations" : "My Performance History"}
              </h3>
              {!isAdminOrManager && reviews.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                   <TrendingUp size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Growth Trend: +{((reviews[0]?.averageRating - (reviews[reviews.length-1]?.averageRating || 0)) / (reviews[reviews.length-1]?.averageRating || 1) * 100).toFixed(0)}%</span>
                </div>
              )}
           </div>

           {!isAdminOrManager && reviews.length > 0 && (
             <div className="card p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                   <h4 className="text-xs font-black text-brand-400 uppercase tracking-[0.3em] mb-4">Your Growth Journey</h4>
                   <div className="flex items-end gap-3 h-32">
                      {reviews.slice(0, 10).reverse().map((r, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                           <div className="w-full bg-white/10 rounded-t-lg relative transition-all group-hover:bg-brand-500" style={{ height: `${(r.averageRating / 5) * 100}%` }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded shadow-xl">
                                 {r.averageRating}
                              </div>
                           </div>
                           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full text-center">{r.period.split('-')[1]}/{r.period.split('-')[0].slice(2)}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
           
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Loading Evaluations...</p>
             </div>
           ) : reviews.length === 0 ? (
             <div className="card p-12 text-center text-slate-400 border-dashed">
                <PieChart size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-xs">No reviews found</p>
             </div>
           ) : reviews.map((review) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={review._id} 
                className="card p-6 group hover:border-brand-200 transition-all cursor-pointer bg-white"
                onClick={() => setSelectedReview(review)}
              >
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-brand-500 font-black text-xl shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-all">
                          {review.averageRating?.toFixed(1)}
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900">
                            {review.employeeId?.firstName} {review.employeeId?.lastName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">{review.reviewType}</span>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.period}</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-0.5">
                       {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={16} 
                            fill={s <= Math.round(review.averageRating) ? "#fbbf24" : "none"} 
                            className={s <= Math.round(review.averageRating) ? "text-amber-400" : "text-slate-200"} 
                          />
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {Object.entries(review.ratings || {}).map(([key, val]) => (
                       <div key={key} className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                          <p className="text-[7px] font-black text-slate-400 uppercase truncate mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-xs font-black text-slate-700">{val}/5</p>
                       </div>
                    ))}
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                    <MessageSquare size={18} className="text-slate-300 shrink-0" />
                    <p className="text-sm text-slate-600 font-medium line-clamp-1 italic">
                       "{review.managerFeedback || "No overall feedback provided."}"
                    </p>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="card p-8 bg-slate-900 text-white relative overflow-hidden">
              <TrendingUp size={140} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
              <h3 className="text-2xl font-black mb-1">Elite Squad</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Performance Leaderboard</p>
              
              <div className="space-y-6 relative z-10">
                 {analytics?.topPerformers?.length > 0 ? analytics.topPerformers.map((rev, i) => (
                    <div key={rev._id} className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          #{i+1}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black truncate">{rev.employeeId?.firstName} {rev.employeeId?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score: {rev.averageRating}/5.0</p>
                       </div>
                    </div>
                 )) : (
                    <p className="text-xs text-slate-500 font-bold">No ranking data available yet.</p>
                 )}
              </div>
           </div>

           <div className="card p-6 bg-white shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Department Stats</h3>
              <div className="space-y-5">
                 {analytics?.deptStats?.length > 0 ? analytics.deptStats.map((dept, i) => (
                    <ProgressItem 
                      key={i} 
                      label={dept._id || "Other"} 
                      val={`${((dept.avgRating / 5) * 100).toFixed(0)}%`} 
                      color={i % 2 === 0 ? "bg-emerald-500" : "bg-brand-500"} 
                    />
                 )) : (
                   <p className="text-xs text-slate-400 font-bold">No department data available.</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto pt-20">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-100">
                         <TrendingUp size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">New Performance Evaluation</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Monthly Growth Track</p>
                      </div>
                   </div>
                   <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X size={24} className="text-slate-400" />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   {/* Header Info */}
                   <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee</label>
                         <select 
                           value={formData.employeeId} 
                           onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                           required
                         >
                            <option value="">Select Employee</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period</label>
                         <input 
                           type="month" 
                           value={formData.period} 
                           onChange={(e) => setFormData({...formData, period: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                           required
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Type</label>
                         <select 
                           value={formData.reviewType} 
                           onChange={(e) => setFormData({...formData, reviewType: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:bg-white focus:border-brand-500"
                         >
                            <option>Monthly</option>
                            <option>Quarterly</option>
                            <option>Yearly</option>
                         </select>
                      </div>
                   </div>

                   {/* Ratings Section */}
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-brand-500 pl-3">Skill Assessment (1-5)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                         {Object.keys(formData.ratings).map((key) => (
                            <div key={key} className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</label>
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="range" min="1" max="5" step="1"
                                    value={formData.ratings[key]}
                                    onChange={(e) => setFormData({
                                      ...formData, 
                                      ratings: { ...formData.ratings, [key]: Number(e.target.value) }
                                    })}
                                    className="flex-1 accent-brand-500"
                                  />
                                  <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xs border border-brand-100">{formData.ratings[key]}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Strengths & Improvements */}
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <ThumbsUp size={14} /> Key Strengths
                         </h4>
                         {formData.strengths.map((s, i) => (
                            <input 
                              key={i} value={s}
                              onChange={(e) => {
                                 const newS = [...formData.strengths];
                                 newS[i] = e.target.value;
                                 setFormData({...formData, strengths: newS});
                              }}
                              placeholder="e.g. Quick Learner"
                              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl py-2 px-4 text-sm font-medium outline-none focus:bg-white"
                            />
                         ))}
                         <button type="button" onClick={() => setFormData({...formData, strengths: [...formData.strengths, ""]})} className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add Strength</button>
                      </div>
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                            <ThumbsDown size={14} /> Improvement Areas
                         </h4>
                         {formData.improvements.map((s, i) => (
                            <input 
                              key={i} value={s}
                              onChange={(e) => {
                                 const newS = [...formData.improvements];
                                 newS[i] = e.target.value;
                                 setFormData({...formData, improvements: newS});
                              }}
                              placeholder="e.g. Communication Skills"
                              className="w-full bg-rose-50/30 border border-rose-100 rounded-xl py-2 px-4 text-sm font-medium outline-none focus:bg-white"
                            />
                         ))}
                         <button type="button" onClick={() => setFormData({...formData, improvements: [...formData.improvements, ""]})} className="text-[10px] font-bold text-rose-600 hover:underline">+ Add Area</button>
                      </div>
                   </div>

                   {/* Feedback */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager's Feedback & Comments</label>
                      <textarea 
                        value={formData.managerFeedback}
                        onChange={(e) => setFormData({...formData, managerFeedback: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-medium min-h-[120px] outline-none focus:bg-white focus:border-brand-500 shadow-inner"
                        placeholder="Share your detailed thoughts on their performance this period..."
                      />
                   </div>

                   {/* Goals & Badges */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">Next Month Goals</h4>
                         {formData.goals.map((g, i) => (
                           <div key={i} className="flex gap-4">
                              <input 
                                placeholder="Goal Title"
                                value={g.title}
                                onChange={(e) => {
                                   const newG = [...formData.goals];
                                   newG[i].title = e.target.value;
                                   setFormData({...formData, goals: newG});
                                }}
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-medium"
                              />
                              <input 
                                type="date"
                                value={g.deadline}
                                onChange={(e) => {
                                   const newG = [...formData.goals];
                                   newG[i].deadline = e.target.value;
                                   setFormData({...formData, goals: newG});
                                }}
                                className="w-32 bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-sm font-medium"
                              />
                           </div>
                         ))}
                         <button type="button" onClick={() => setFormData({...formData, goals: [...formData.goals, {title: "", deadline: ""}]})} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add Goal</button>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-3">Rewards & Badges</h4>
                         <div className="flex flex-wrap gap-2">
                            {["Employee of the Month", "Team Player", "Rising Star", "Problem Solver", "Best Performer"].map(badge => (
                               <button 
                                 key={badge}
                                 type="button"
                                 onClick={() => {
                                    const current = formData.badges || [];
                                    const next = current.includes(badge) ? current.filter(b => b !== badge) : [...current, badge];
                                    setFormData({...formData, badges: next});
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                                   formData.badges?.includes(badge) 
                                   ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200' 
                                   : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-amber-200'
                                 }`}
                               >
                                  {badge}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
                      <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Cancel</button>
                      <Button type="submit" className="px-12 py-4 rounded-2xl shadow-xl shadow-brand-100 font-black tracking-tight">Submit Evaluation</Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-brand-500 text-white flex flex-col items-center justify-center shadow-2xl shadow-brand-100">
                         <span className="text-3xl font-black">{selectedReview.averageRating?.toFixed(1)}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Score</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900">{selectedReview.employeeId?.firstName} {selectedReview.employeeId?.lastName}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedReview.employeeId?.designation} • {selectedReview.period}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedReview(null)} className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                      <X size={28} className="text-slate-300" />
                   </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <div className="md:col-span-2 space-y-10">
                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="text-brand-500" size={20} /> Evaluation Breakdown
                         </h4>
                         <div className="grid grid-cols-2 gap-6">
                            {Object.entries(selectedReview.ratings || {}).map(([key, val]) => (
                               <div key={key} className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                     <span className="text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                                     <span className="text-slate-900">{val}/5</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <div className={`h-full ${val >= 4 ? 'bg-emerald-500' : val >= 3 ? 'bg-brand-500' : 'bg-rose-500'}`} style={{ width: `${(val/5)*100}%` }}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="text-brand-500" size={20} /> Detailed Feedback
                         </h4>
                         <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-medium">
                            {selectedReview.managerFeedback}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Target className="text-brand-500" size={20} /> Assigned Goals
                         </h4>
                         <div className="grid gap-4">
                            {selectedReview.goals?.map((g, i) => (
                               <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:border-brand-200 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                        <CheckCircle2 size={20} />
                                     </div>
                                     <div>
                                        <p className="text-sm font-black text-slate-900">{g.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Deadline: {g.deadline ? new Date(g.deadline).toLocaleDateString() : 'N/A'}</p>
                                     </div>
                                  </div>
                                  <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">{g.status}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-1 space-y-10">
                      <div className="p-6 bg-brand-500 rounded-3xl text-white shadow-xl shadow-brand-100">
                         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Recommendation</h4>
                         <p className="text-xl font-black">{selectedReview.recommendation}</p>
                         {selectedReview.status === "Acknowledged" && (
                           <div className="mt-4 pt-4 border-t border-white/20">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status</p>
                             <div className="flex items-center gap-2 text-xs font-black">
                               <CheckCircle2 size={14} /> Acknowledged by Employee
                             </div>
                           </div>
                         )}
                      </div>

                      {selectedReview.badges?.length > 0 && (
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Recognition & Badges</h4>
                           <div className="flex flex-wrap gap-2">
                              {selectedReview.badges.map(badge => (
                                 <span key={badge} className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                                    🏆 {badge}
                                 </span>
                              ))}
                           </div>
                        </div>
                      )}

                      {!isAdminOrManager && selectedReview.status === "Submitted" && (
                        <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl">
                           <h4 className="text-xs font-black uppercase tracking-widest mb-4">Acknowledge Review</h4>
                           <p className="text-[10px] text-slate-400 font-medium mb-4 leading-relaxed">Please provide your self-feedback and acknowledge this review to complete the cycle.</p>
                           <textarea 
                             className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs font-medium min-h-[100px] outline-none focus:border-brand-500 mb-4"
                             placeholder="Your self-feedback..."
                             value={ackFeedback}
                             onChange={(e) => setAckFeedback(e.target.value)}
                           />
                           <Button 
                             onClick={async () => {
                                try {
                                  await api.patch(`/performance/${selectedReview._id}/status`, { 
                                    status: "Acknowledged", 
                                    employeeSelfFeedback: ackFeedback 
                                  });
                                  toast.success("Review acknowledged!");
                                  setSelectedReview(null);
                                  fetchData();
                                } catch (err) {
                                  toast.error("Failed to acknowledge review");
                                }
                             }}
                             className="w-full py-3 rounded-xl font-black text-xs"
                           >
                             Sign & Acknowledge
                           </Button>
                        </div>
                      )}

                      {(selectedReview.employeeSelfFeedback || (!isAdminOrManager && selectedReview.status === "Acknowledged")) && (
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Self Feedback</h4>
                           <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs font-medium text-slate-600 italic">
                              "{selectedReview.employeeSelfFeedback || "No self-feedback provided."}"
                           </div>
                        </div>
                      )}

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Top Strengths</h4>
                         <div className="space-y-3">
                            {selectedReview.strengths?.map((s, i) => (
                               <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                  <ThumbsUp size={14} className="text-emerald-500" /> {s}
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Areas for Growth</h4>
                         <div className="space-y-3">
                            {selectedReview.improvements?.map((s, i) => (
                               <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                                  <ThumbsDown size={14} className="text-rose-500" /> {s}
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="p-6 bg-brand-500 rounded-3xl text-white shadow-xl shadow-brand-100">
                         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Recommendation</h4>
                         <p className="text-xl font-black">{selectedReview.recommendation}</p>
                         <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">Share Report</button>
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

function ProgressItem({ label, val, color }) {
  return (
    <div className="space-y-1.5">
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-900">{val}</span>
       </div>
       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: val }}></div>
       </div>
    </div>
  );
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

