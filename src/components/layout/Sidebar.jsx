import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  CreditCard,
  Briefcase,
  BarChart3,
  Files,
  Settings,
  ShieldCheck,
  PieChart,
  UserCircle,
  ChevronRight,
  Zap,
  HandIcon
} from "lucide-react";

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || "Employee";

  const sections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", to: "/", icon: LayoutDashboard, hot: true },
        { label: "Employees", to: "/employees", icon: Users, roles: ["Admin", "HR"] },
        { label: "Attendance", to: "/attendance", icon: CalendarCheck, roles: ["Admin", "HR"] },
        { label: "Leaves", to: "/leaves", icon: FileText, roles: ["Admin", "HR"] },
      ]
    },
    {
      title: "Applications",
      items: [
        { label: "Payroll", to: "/payroll", icon: CreditCard, roles: ["Admin", "HR"] },
        { label: "Recruitment", to: "/recruitment", icon: Briefcase, roles: ["Admin", "HR"] },
        { label: "Performance", to: "/performance", icon: BarChart3, roles: ["Admin", "HR"] },
        { label: "Documents", to: "/documents", icon: Files, roles: ["Admin", "HR"] },
      ]
    },
    {
      title: "Administration",
      items: [
        { label: "Compliance", to: "/compliance", icon: ShieldCheck, roles: ["Admin"] },
        { label: "Reports", to: "/reports", icon: PieChart, roles: ["Admin", "HR"] },
        { label: "Settings", to: "/settings", icon: Settings, roles: ["Admin"] },
      ]
    },
    {
      title: "Self Service",
      items: [
        { label: "My Profile", to: "/ess/profile", icon: UserCircle },
        { label: "Apply Leave", to: "/ess/leave", icon: HandIcon, roles: ["HR", "Employee"] },
        { label: "My Attendance", to: "/ess/attendance", icon: CalendarCheck, roles: ["HR", "Employee"] },
        { label: "My Payslips", to: "/ess/payslips", icon: CreditCard, roles: ["HR", "Employee"] },
        { label: "My Performance", to: "/performance", icon: BarChart3, roles: ["HR", "Employee"] },
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(role))
  })).filter(section => section.items.length > 0);

  return (
    <aside className="h-screen w-64 shrink-0 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 z-30">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-50">
        <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
          <Zap size={22} fill="white" stroke="white" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-slate-900">NexHR</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {filteredSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-8" : ""}>
            <p className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {section.title}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[10px]">
            {role[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
            <p className="text-xs font-black text-slate-900 truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, to, icon: Icon, hot }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
          ? "bg-[#f97316] text-white shadow-xl shadow-orange-200"
          : "text-slate-500 hover:bg-slate-50 hover:text-[#f97316]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500"} />
          <span className={`flex-1 truncate ${isActive ? "text-white" : "text-slate-600"}`}>{label}</span>
          {hot && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shadow-sm ${isActive ? 'bg-white text-orange-500' : 'bg-rose-500 text-white'
              }`}>
              Hot
            </span>
          )}
          {!isActive && <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />}
        </>
      )}
    </NavLink>
  );
}
