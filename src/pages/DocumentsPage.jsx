import { useEffect, useState, useRef } from "react";
import { 
  Files, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  Plus,
  X,
  FileText,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiDelete, apiPost } from "../services/apiClient";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    type: "ID Proof",
    fileUrl: ""
  });
  const [empSearch, setEmpSearch] = useState("");
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowEmpDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await apiGet("/documents");
      // Backend successResponse structure is { success, message, data, meta }
      // apiClient.apiGet returns res.data which is the body.
      const docsData = res?.data || (Array.isArray(res) ? res : []);
      setDocs(docsData);
    } catch (e) {
      console.error("Fetch Docs Error:", e);
    }
  };

  const fetchEmployees = async (searchTerm = "") => {
    try {
      const res = await apiGet("/employees", { limit: 10, search: searchTerm, role: "!Admin" });
      const empData = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(empData);
    } catch (e) {
      console.error("Fetch Employees Error:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(empSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [empSearch]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDownload = async (id, title) => {
    try {
      // Increase timeout for large file transfers (2 minutes)
      const res = await apiGet(`/documents/${id}`, {}, { timeout: 120000 });
      const doc = res.data;
      if (!doc?.fileUrl) return toast.error("File not found");
      
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error("Download failed");
    }
  };

  const handleDelete = (id) => {
    setSelectedDocId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDocId) {
      try {
        await apiDelete(`/documents/${selectedDocId}`);
        toast.success("Document deleted successfully");
        fetchDocs();
      } catch (e) {
        toast.error("Delete failed");
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedDocId(null);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File limit 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.title || !formData.fileUrl) {
      toast.error("Please fill all fields and upload a file.");
      return;
    }
    setUploading(true);
    try {
      await apiPost("/documents", formData);
      toast.success("Document uploaded successfully");
      setShowUploadModal(false);
      setFormData({ employeeId: "", title: "", type: "ID Proof", fileUrl: "" });
      fetchDocs();
    } catch (err) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const idProofs = docs.filter(d => d.type === "ID Proof").length;
  const contracts = docs.filter(d => d.type === "Contract").length;
  const payslips = docs.filter(d => d.type === "Payslip").length;
  const others = docs.length - idProofs - contracts - payslips;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Document Management</h1>
        <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
           <Upload size={18} /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <DocTypeCard label="ID Proofs" count={idProofs} icon={File} color="bg-[#f97316]" />
         <DocTypeCard label="Contracts" count={contracts} icon={File} color="bg-blue-500" />
         <DocTypeCard label="Payslips" count={payslips} icon={File} color="bg-emerald-500" />
         <DocTypeCard label="Others" count={others} icon={File} color="bg-amber-500" />
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
                           <div className="flex items-center gap-1 justify-end">
                              <button 
                                onClick={() => handleDownload(doc._id, doc.title)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Download"
                              >
                                <Download size={18} />
                              </button>
                              <button onClick={() => handleDelete(doc._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
             </table>
          </div>
       </div>

       {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-light text-slate-900">Upload Document</h2>
                <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="p-8 space-y-6">
                 <div className="space-y-1 relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</label>
                    
                    <div 
                      onClick={() => setShowEmpDropdown(!showEmpDropdown)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold cursor-pointer flex items-center justify-between hover:border-slate-300 transition-all"
                    >
                       <span className={formData.employeeId ? "text-slate-900" : "text-slate-400"}>
                          {formData.employeeId 
                            ? employees.find(e => e._id === formData.employeeId)?.firstName + " " + employees.find(e => e._id === formData.employeeId)?.lastName
                            : "Select Employee"}
                       </span>
                       <ChevronDown size={16} className={`text-slate-400 transition-transform ${showEmpDropdown ? "rotate-180" : ""}`} />
                    </div>

                    <AnimatePresence>
                       {showEmpDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-[60] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                          >
                             <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                <div className="relative">
                                   <input 
                                     autoFocus
                                     type="text" 
                                     className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-xs font-bold outline-none focus:border-[#f97316]"
                                     placeholder="Search name or ID..."
                                     value={empSearch}
                                     onChange={(e) => setEmpSearch(e.target.value)}
                                     onClick={(e) => e.stopPropagation()}
                                   />
                                   <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                             </div>
                             <div className="max-h-48 overflow-y-auto py-1">
                                {employees.map(emp => (
                                   <div 
                                     key={emp._id} 
                                     onClick={() => {
                                        setFormData({...formData, employeeId: emp._id});
                                        setShowEmpDropdown(false);
                                     }}
                                     className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#f97316] cursor-pointer transition-colors flex items-center justify-between"
                                   >
                                      <div className="flex flex-col">
                                         <span>{emp.firstName} {emp.lastName}</span>
                                         <span className="text-[10px] text-[#f97316] uppercase font-black">{emp.role}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-bold">{emp.employeeId}</span>
                                   </div>
                                ))}
                                {employees.length === 0 && (
                                   <div className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                                      No employees found
                                   </div>
                                )}
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none focus:border-slate-900 transition-all"
                         placeholder="e.g. Aadhar Card"
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         required
                       />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm font-semibold outline-none focus:border-slate-900 transition-all"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="ID Proof">ID Proof</option>
                            <option value="Contract">Contract</option>
                            <option value="Educational">Educational</option>
                            <option value="Experience">Experience</option>
                            <option value="Payslip">Payslip</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">File</label>
                    <div className="flex gap-2">
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="flex-1 border border-slate-200 bg-slate-50 rounded-lg py-3 px-4 flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-slate-400"
                       >
                          <Upload size={16} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-600 truncate">{formData.fileUrl ? 'File Selected' : 'Choose File'}</span>
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                    <button 
                      disabled={uploading} 
                      className="flex-[2] py-3 bg-[#f97316] text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all shadow-sm disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete Now"
        cancelText="Keep Document"
        type="danger"
      />
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
