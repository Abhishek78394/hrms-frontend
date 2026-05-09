import { useSelector } from "react-redux";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Edit, Info } from "lucide-react";
import Button from "../components/ui/Button";

export default function ESSProfilePage() {
  const user = useSelector((s) => s.auth.user);

  // Extract initial for avatar fallback
  const initial = user?.fullName ? user.fullName.charAt(0) : (user?.username ? user.username.charAt(0) : "U");

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
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName || user?.username}&background=f1f5f9&color=475569&size=256&bold=true`}
                  alt="Avatar"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="text-center md:text-left mb-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.fullName || user?.username || "User Profile"}</h1>
                  <div className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-lg border border-orange-100 shadow-sm">Verified</div>
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Shield size={14} className="text-orange-500" />
                  {user?.role || "Team Member"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mb-2">
              <button className="px-8 py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all border border-slate-200">Export PDF</button>
              <Button className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-100">
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
              <InfoItem icon={Mail} label="Professional Email" value={user?.email || "Not Provided"} />
              <InfoItem icon={Phone} label="Direct Contact" value={user?.phone || "+1 (555) 000-0000"} />
              <InfoItem icon={MapPin} label="Office Location" value="HQ - New York, USA" />
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
              <InfoItem icon={Briefcase} label="Current Department" value={user?.department || "General Operations"} />
              <InfoItem icon={Calendar} label="Date of Joining" value={user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Jan 15, 2024"} />
              <InfoItem icon={Shield} label="Employee ID" value={user?.employeeId || "EMP-0012"} />
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
              {user?.about || "Senior professional dedicated to driving organizational excellence through innovation and collaborative leadership. Committed to maintaining the highest standards of the NexHR ecosystem."}
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
