import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Edit, Info, Plus } from "lucide-react";
import Button from "../components/ui/Button";
import { apiGet } from "../services/apiClient";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { updateUser } from "../features/auth/authSlice";

export default function ESSProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    about: ""
  });

  const fetchProfile = async () => {
     try {
        const res = await apiGet("/employees/me");
        setProfile(res.data);
        if (res.data) {
          setFormData({
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
            about: res.data.about || ""
          });
        }
     } catch (e) {
        console.error("Profile fetch failed", e);
     }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
       const response = await api.patch("/employees/me", formData);
       toast.success("Profile updated successfully");
       
       // Update global auth state
       dispatch(updateUser({ 
         firstName: formData.firstName, 
         lastName: formData.lastName,
         fullName: `${formData.firstName} ${formData.lastName}`
       }));

       setIsEditModalOpen(false);
       fetchProfile();
    } catch (e) {
       toast.error("Failed to update profile");
    }
  };

  const profileData = profile || user;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Hero Header */}
      <div className="card overflow-hidden border-none shadow-2xl shadow-slate-200">
        <div className="h-48 bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent scale-150"></div>
        </div>
        <div className="px-12 pb-12">
          <div className="relative -mt-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white overflow-hidden shadow-2xl bg-white ring-1 ring-slate-100">
                <img
                  src={profileData?.profileImage || `https://ui-avatars.com/api/?name=${profileData?.fullName || profileData?.firstName || "User"}&background=f1f5f9&color=475569&size=256&bold=true`}
                  alt="Avatar"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="text-center md:text-left mb-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profileData?.fullName || (profileData?.firstName + " " + profileData?.lastName) || "User Profile"}</h1>
                  <div className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-lg border border-orange-100 shadow-sm">Verified</div>
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Shield size={14} className="text-orange-500" />
                  {profileData?.role || "Team Member"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mb-2">
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-100"
              >
                <Edit size={18} /> Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-10">
          <div className="card p-8 border-none shadow-xl shadow-slate-100 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-150 transition-transform duration-1000">
              <Mail size={80} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Contact Information
            </h3>
            <div className="space-y-6">
              <InfoItem icon={Mail} label="Professional Email" value={profileData?.email || "Not Provided"} />
              <InfoItem icon={Phone} label="Direct Contact" value={profileData?.phone || "+91 00000 00000"} />
              <InfoItem icon={MapPin} label="Office Location" value={profileData?.address || "HQ - Main Office"} />
            </div>
          </div>

          <div className="card p-8 border-none shadow-xl shadow-slate-100 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-150 transition-transform duration-1000">
              <Briefcase size={80} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Employment Details
            </h3>
            <div className="space-y-6">
              <InfoItem icon={Briefcase} label="Current Department" value={profileData?.department || "General Operations"} />
              <InfoItem icon={Calendar} label="Date of Joining" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Not Set"} />
              <InfoItem icon={Shield} label="Employee ID" value={profileData?.employeeId || "N/A"} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-10">
          <div className="card p-10 border-none shadow-xl shadow-slate-100 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Info size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900">About Me</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              {profileData?.about || "No profile description provided yet."}
            </p>
          </div>

          <div className="card overflow-hidden border-none shadow-xl shadow-slate-100 bg-white">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Recent Activity Log</h3>
              <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg">Last 30 Days</span>
            </div>
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Calendar size={40} />
              </div>
              <p className="text-slate-400 italic font-medium">No recent activity detected on this account.</p>
              <button className="mt-6 text-sm font-black text-orange-500 hover:text-orange-600 transition-colors">View All Logs</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Profile</h3>
                 <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus size={20} className="rotate-45" />
                 </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                       <input 
                          type="text" 
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 rounded-xl outline-none transition-all text-sm font-semibold text-slate-700" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                       <input 
                          type="text" 
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 rounded-xl outline-none transition-all text-sm font-semibold text-slate-700" 
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone</label>
                    <input 
                       type="text" 
                       maxLength="10"
                       value={formData.phone}
                       onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) setFormData({...formData, phone: val});
                       }}
                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 rounded-xl outline-none transition-all text-sm font-semibold text-slate-700" 
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Location</label>
                    <input 
                       type="text" 
                       value={formData.address}
                       onChange={(e) => setFormData({...formData, address: e.target.value})}
                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 rounded-xl outline-none transition-all text-sm font-semibold text-slate-700" 
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">About</label>
                    <textarea 
                       rows="2"
                       value={formData.about}
                       onChange={(e) => setFormData({...formData, about: e.target.value})}
                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 rounded-xl outline-none transition-all text-sm font-semibold text-slate-700 resize-none" 
                    ></textarea>
                 </div>

                 <div className="pt-2 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <Button type="submit" className="flex-[2] py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 border-none text-xs font-bold uppercase tracking-widest shadow-none">
                       Update Profile
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-5 group cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all group-hover:scale-110 duration-300">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
        <p className="text-base font-black text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
