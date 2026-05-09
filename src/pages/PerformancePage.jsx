import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Award,
  ChevronRight,
  MoreVertical,
  Plus
} from "lucide-react";
import axios from "axios";
import Button from "../components/ui/Button";

export default function PerformancePage() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/performance");
      setReviews(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Performance Evaluation</h1>
        <Button className="flex items-center gap-2">
           <Plus size={18} /> New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {reviews.map((review) => (
               <div key={review._id} className="card p-6 group hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-brand-500 font-black text-xl shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-all">
                           {review.averageRating?.toFixed(1)}
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-slate-900">{review.employeeId?.firstName} {review.employeeId?.lastName}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period: {review.period}</p>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star 
                             key={s} 
                             size={16} 
                             fill={s <= Math.round(review.averageRating) ? "currentColor" : "none"} 
                             className={s <= Math.round(review.averageRating) ? "text-amber-400" : "text-slate-200"} 
                           />
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     {Object.entries(review.ratings || {}).map(([key, val]) => (
                        <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                           <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-brand-500" style={{ width: `${(val/5)*100}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-slate-700">{val}</span>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-xl text-sm text-slate-600 font-medium italic border border-dashed border-slate-200">
                     <MessageSquare size={16} className="text-slate-400 shrink-0" />
                     "{review.feedback}"
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewer: <span className="text-slate-900">{review.reviewerId?.fullName}</span></p>
                     <button className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1">View Full Report <ChevronRight size={14} /></button>
                  </div>
               </div>
            ))}
         </div>

         <div className="lg:col-span-1 space-y-6">
            <div className="card p-8 bg-gradient-to-br from-brand-500 to-orange-600 text-white relative overflow-hidden">
               <Award size={120} className="absolute -right-10 -bottom-10 opacity-20 rotate-12" />
               <h3 className="text-2xl font-black mb-1">Company Peak</h3>
               <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-8">Quarterly Leaderboard</p>
               
               <div className="space-y-6 relative z-10">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">#{i}</div>
                        <div className="flex-1">
                           <p className="text-sm font-black">Top Performer {i}</p>
                           <p className="text-[10px] font-bold text-brand-100 uppercase">Score: 4.9/5.0</p>
                        </div>
                     </div>
                  ))}
               </div>
               
               <button className="w-full mt-10 py-3 bg-white text-brand-600 rounded-xl text-sm font-black hover:bg-brand-50 transition-all shadow-xl shadow-brand-900/20">
                  Full Ranking
               </button>
            </div>

            <div className="card p-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Review Status</h3>
               <div className="space-y-4">
                  <ProgressItem label="Reviews Completed" val="85%" color="bg-emerald-500" />
                  <ProgressItem label="Pending Feedback" val="12%" color="bg-amber-500" />
                  <ProgressItem label="Disputed Reviews" val="03%" color="bg-rose-500" />
               </div>
            </div>
         </div>
      </div>
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
