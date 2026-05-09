export default function DataTable({ columns, rows, empty = "No records found" }) {
  return (
    <div className="card w-full border-none shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col, idx) => (
                <th 
                  key={col.key} 
                  className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 ${idx === 0 ? 'rounded-tl-2xl' : ''} ${idx === columns.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-slate-400 italic" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr 
                  key={row._id || idx} 
                  className="group hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {columns.map((col, cIdx) => (
                    <td 
                      key={col.key} 
                      className={`px-6 py-4 text-sm text-slate-600 font-medium ${cIdx === 0 ? 'text-slate-900 font-semibold' : ''}`}
                    >
                      {col.render ? col.render(row) : (row[col.key] || "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
