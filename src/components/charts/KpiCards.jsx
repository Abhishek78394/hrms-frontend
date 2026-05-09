export default function KpiCards({ stats }) {
  const items = [["Total Employees", stats?.employees || 0], ["Attendance Records", stats?.attendance || 0], ["Payroll Entries", stats?.payroll || 0], ["Performance Reviews", stats?.performance || 0]];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => <div key={label} className="card p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>;
}
