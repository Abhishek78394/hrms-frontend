export default function Input({ error, ...props }) {
  return (
    <div className="w-full">
      <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all" {...props} />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
