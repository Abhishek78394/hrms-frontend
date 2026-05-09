import clsx from "clsx";

export default function Button({ className, variant = "primary", children, ...props }) {
  const styles = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  };

  return (
    <button 
      className={clsx(
        "rounded-2xl px-6 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none", 
        styles[variant], 
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
}
