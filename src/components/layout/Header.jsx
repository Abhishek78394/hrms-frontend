import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Mail,
  LogOut,
  LayoutGrid,
  Maximize2,
  ChevronRight,
  Home,
  User as UserIcon,
  Settings
} from "lucide-react";
import toast from "react-hot-toast";
import { logout } from "../../features/auth/authSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Successfully logged out. See you soon!");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Branding Fallback / Spacing */}
        <div className="flex-1"></div>

        {/* Right: User */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-6 border-r border-slate-100 hidden">
            <HeaderAction icon={Maximize2} />
            <HeaderAction icon={Mail} count={5} />
            <HeaderAction icon={Bell} count={2} pulse />
          </div>

          <div className="flex items-center gap-4 group relative py-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">
                {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.username || "Admin"))}
              </p>
              <p className="text-[10px] font-black text-orange-500 mt-1.5 uppercase tracking-widest">{user?.role || "Staff"}</p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-orange-50 border-2 border-white shadow-lg overflow-hidden cursor-pointer ring-1 ring-slate-100 group-hover:ring-orange-500 transition-all duration-300">
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.username || "Admin")))}&background=f97316&color=fff&bold=true`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-50">
              <div className="px-4 py-4 mb-2 bg-slate-50/50 rounded-2xl border border-slate-50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Connected as</p>
                <p className="text-sm font-black text-slate-900 truncate">{user?.email}</p>
              </div>

              <Link to="/ess/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-colors">
                <UserIcon size={18} />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-colors">
                <Settings size={18} />
                <span>Account Settings</span>
              </Link>

              <div className="h-px bg-slate-50 my-2 mx-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-rose-600 hover:bg-rose-50 transition-all group/logout"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover/logout:bg-rose-100 transition-colors">
                  <LogOut size={18} />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Compact Breadcrumbs */}
      <div className="px-8 py-2 bg-slate-50/50 flex items-center border-t border-slate-100">
        <nav className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-orange-500 transition-colors flex items-center gap-1">
             <Home size={10} /> Home
          </Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <div key={name} className="flex items-center gap-2">
                <ChevronRight size={10} className="text-slate-300" />
                <Link
                  to={routeTo}
                  className={`hover:text-orange-500 transition-colors ${isLast ? "text-orange-600 pointer-events-none" : ""}`}
                >
                  {name.replace("-", " ")}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function HeaderAction({ icon: Icon, count, pulse }) {
  return (
    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all relative group/action">
      <Icon size={20} className="group-hover/action:scale-110 transition-transform" />
      {count > 0 && (
        <span className={`absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-black text-white rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${pulse ? "animate-pulse" : ""}`}>
          {count}
        </span>
      )}
    </button>
  );
}
