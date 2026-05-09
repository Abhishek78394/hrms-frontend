import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { 
  Plus, 
  Check, 
  X, 
  Eye, 
  Clock, 
  ChevronDown,
  Upload,
  FileText,
  Calendar,
  Filter,
  Download,
  AlertCircle,
  MessageCircle,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  MoreVertical
} from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPost, apiPatch } from "../services/apiClient";

export default function LeavesPage() {
  const user = useSelector((s) => s.auth.user);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, leaveId: null, status: '', reason: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [balances, setBalances] = useState({
    vacation: { total: 20, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 10, used: 0 },
    emergency: { total: 5, used: 0 }
  });
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({ 
    type: "casual", 
    startDate: "", 
    endDate: "", 
    reason: "",
    supportingDocument: "" 
  });
  const fileInputRef = useRef(null);

  const fetchLeaves = async () => {
    try {
      const res = await apiGet("/leaves");
      setLeaves(res.data || []);
      
      if (user?.role !== 'Admin') {
        const balRes = await apiGet("/leaves/balance");
        if (balRes.data) {
          setBalances(balRes.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("File limit 8MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, supportingDocument: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (new Date(formData.startDate) < new Date(today)) {
      toast.error("Start date cannot be in the past");
      setLoading(false);
      return;
    }

    try {
      await apiPost("/leaves", formData);
      toast.success("Request submitted");
      setShowForm(false);
      setFormData({ type: "casual", startDate: "", endDate: "", reason: "", supportingDocument: "" });
      fetchLeaves();
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionModal.status === 'rejected' && !actionModal.reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await apiPatch(`/leaves/${actionModal.leaveId}/action`, { 
        status: actionModal.status,
        comments: actionModal.reason 
      });
      toast.success(`Leave ${actionModal.status}`);
      setActionModal({ show: false, leaveId: null, status: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesStatus = activeTab === 'all' || l.status === activeTab;
    const fullName = `${l.employeeId?.firstName} ${l.employeeId?.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          l.employeeId?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 bg-[#ffffff] min-h-screen animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">Leave Management</h1>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <p className="text-sm text-slate-500 font-medium tracking-wide">System active and up to date</p>
          </div>
        </div>
        {user?.role !== 'Admin' && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
             Request Time Off
          </button>
        )}
      </div>

      {/* Simplified Metrics */}
      {user?.role !== 'Admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <SimpleMetric label="Annual Leave" current={balances.vacation.used.toString().padStart(2, '0')} total={balances.vacation.total.toString()} />
          <SimpleMetric label="Medical Leave" current={balances.sick.used.toString().padStart(2, '0')} total={balances.sick.total.toString()} />
          <SimpleMetric label="Casual Leave" current={balances.casual.used.toString().padStart(2, '0')} total={balances.casual.total.toString()} />
          <SimpleMetric label="Other Leave" current={balances.emergency.used.toString().padStart(2, '0')} total={balances.emergency.total.toString()} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Navigation & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
           <div className="flex items-center gap-8">
              <NavTab active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All Requests" count={leaves.length} />
              <NavTab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Pending" count={leaves.filter(l => l.status === 'pending').length} />
              <NavTab active={activeTab === 'approved'} onClick={() => setActiveTab('approved')} label="Approved" />
              <NavTab active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} label="Rejected" />
           </div>

           <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Filter by name or employee ID" 
                 className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-slate-400 transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Flat Professional Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left table-fixed border-collapse">
              <thead>
                 <tr>
                    <th className="w-[200px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Employee</th>
                    <th className="w-[120px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                    <th className="w-[160px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Duration</th>
                    <th className="w-[260px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Reasoning</th>
                    <th className="w-[200px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                    <th className="w-[80px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Docs</th>
                    <th className="w-[100px] py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredLeaves.length > 0 ? filteredLeaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/30 transition-colors">
                       <td className="py-6 align-top">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/50">
                                {l.employeeId?.firstName?.[0]}{l.employeeId?.lastName?.[0]}
                             </div>
                             <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{l.employeeId?.firstName} {l.employeeId?.lastName}</p>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 tracking-tight">{l.employeeId?.employeeId}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6 align-top">
                          <span className="text-xs text-slate-600 font-semibold capitalize">
                             {l.type}
                          </span>
                       </td>
                       <td className="py-6 align-top">
                          <div className="text-xs text-slate-600 font-semibold space-y-1">
                             <p>{new Date(l.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                             <p className="text-slate-300">—</p>
                             <p>{new Date(l.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                       </td>
                       <td className="py-6 align-top pr-6">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed break-all whitespace-pre-wrap">
                             {l.reason}
                          </p>
                       </td>
                       <td className="py-6 align-top">
                          <div className="flex flex-col gap-4 items-start">
                            <FlatStatus status={l.status} />
                            
                            {l.status === 'rejected' && l.comments && (
                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/50 w-full">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Decision Note</p>
                                 <p className="text-[11px] text-slate-600 font-medium leading-normal break-all whitespace-pre-wrap">
                                   {l.comments}
                                 </p>
                              </div>
                            )}
                          </div>
                       </td>
                       <td className="py-6 text-center align-top">
                          {l.supportingDocument ? (
                             <button 
                               onClick={() => setPreviewDoc(l.supportingDocument)}
                               className="p-2 text-slate-400 hover:text-slate-900 transition-colors inline-flex" 
                               title="View Document"
                             >
                               <Eye size={18} />
                             </button>
                          ) : (
                             <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest block mt-2">N/A</span>
                          )}
                       </td>
                       <td className="py-6 text-right align-top">
                          <div className="flex items-center justify-end gap-1">
                             {l.status === 'pending' && (user?.role === 'Admin' || user?.role === 'HR') ? (
                                <>
                                  <button onClick={() => setActionModal({ show: true, leaveId: l._id, status: 'approved', reason: '' })} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve"><Check size={18} /></button>
                                  <button onClick={() => setActionModal({ show: true, leaveId: l._id, status: 'rejected', reason: '' })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Reject"><X size={18} /></button>
                                </>
                             ) : (
                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                   <MoreVertical size={16} />
                                </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr>
                       <td colSpan="7" className="py-32 text-center">
                          <p className="text-sm text-slate-400 font-medium">No results found matching your criteria</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-light text-slate-900">New Request</h2>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Absence Type</label>
                        <div className="relative">
                          <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none appearance-none focus:border-slate-900 transition-all"
                              value={formData.type}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                          >
                              <option value="casual">Casual Leave</option>
                              <option value="sick">Medical Leave</option>
                              <option value="vacation">Vacation</option>
                              <option value="emergency">Emergency</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document</label>
                       <div className="flex gap-2">
                          <div 
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 border border-slate-200 bg-slate-50 rounded-lg py-3 px-4 flex items-center gap-2 cursor-pointer transition-all hover:border-slate-400"
                          >
                             <Upload size={14} className="text-slate-400" />
                             <span className="text-sm font-semibold text-slate-600 truncate">{formData.supportingDocument ? 'Attached' : 'Upload File'}</span>
                          </div>
                          {formData.supportingDocument && (
                            <div className="w-12 h-12 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                               {formData.supportingDocument.startsWith('data:image') ? (
                                 <img src={formData.supportingDocument} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 <FileText size={18} className="text-slate-400" />
                               )}
                            </div>
                          )}
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                       <input 
                         type="date" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none focus:border-slate-900 transition-all"
                         value={formData.startDate}
                         min={today}
                         onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                         required
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                       <input 
                         type="date" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none focus:border-slate-900 transition-all"
                         value={formData.endDate}
                         min={formData.startDate || today}
                         onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Justification</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 px-5 text-sm font-semibold outline-none focus:border-slate-900 min-h-[120px] resize-none transition-all"
                      placeholder="Specify your reason..."
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      required
                    />
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                    <button 
                      disabled={loading} 
                      className="flex-[2] py-3 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Submit Request"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Action Confirmation */}
      {actionModal.show && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-8">
              <div className="mb-6">
                 <h2 className="text-xl font-light text-slate-900 capitalize">{actionModal.status} Leave Request</h2>
                 <p className="text-sm text-slate-400 font-medium mt-1">Please confirm this administrative action.</p>
              </div>

              {actionModal.status === 'rejected' && (
                 <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rejection Reason</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none focus:border-slate-900 min-h-[100px] resize-none transition-all"
                      placeholder="Provide a reason for the employee..."
                      value={actionModal.reason}
                      onChange={(e) => setActionModal({...actionModal, reason: e.target.value})}
                    />
                 </div>
              )}

              <div className="flex gap-4">
                 <button 
                   onClick={() => setActionModal({ show: false, leaveId: null, status: '', reason: '' })}
                   className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleAction}
                   className={`flex-[2] py-3 text-white rounded-lg text-sm font-semibold shadow-sm transition-all ${
                     actionModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                   }`}
                 >
                    Confirm {actionModal.status}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12">
           <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300">
              <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                 <h3 className="text-sm font-bold text-slate-900">Document Review</h3>
                 <div className="flex items-center gap-3">
                    <a href={previewDoc} download className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={20} /></a>
                    <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><X size={20} /></button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-8">
                 {previewDoc.startsWith('data:image') ? (
                    <img src={previewDoc} alt="Preview" className="max-w-full h-auto shadow-lg rounded-lg border-4 border-white" />
                 ) : (
                    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-100">
                       <FileText size={60} strokeWidth={1} />
                       <p className="mt-4 text-sm font-bold text-slate-900">File Preview Not Available</p>
                       <a href={previewDoc} download className="mt-6 px-8 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm">Download File</a>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function SimpleMetric({ label, current, total }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">{label}</p>
       <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light text-slate-900 tracking-tighter">{current}</span>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">/ {total} Days</span>
       </div>
    </div>
  );
}

function NavTab({ active, onClick, label, count }) {
  return (
    <button 
       onClick={onClick}
       className={`relative py-2 text-sm font-semibold transition-all ${
          active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
       }`}
    >
       {label}
       {count !== undefined && (
          <span className="ml-2 text-[10px] font-bold opacity-60">({count})</span>
       )}
       {active && (
          <div className="absolute -bottom-6 left-0 w-full h-0.5 bg-slate-900 rounded-full"></div>
       )}
    </button>
  );
}

function FlatStatus({ status }) {
  const dots = {
    approved: 'bg-emerald-500',
    rejected: 'bg-rose-500',
    pending: 'bg-amber-500'
  };
  const texts = {
    approved: 'text-emerald-700',
    rejected: 'text-rose-700',
    pending: 'text-amber-700'
  };

  return (
    <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${texts[status]}`}>
       <div className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></div>
       {status}
    </div>
  );
}
