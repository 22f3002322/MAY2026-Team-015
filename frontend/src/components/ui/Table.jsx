const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found",
  className = "",
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-slate-500 dark:text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <span className="text-2xl text-slate-400" role="img" aria-label="No data">📄</span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                      No Records Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="border-b border-slate-100 dark:border-slate-800/50 transition hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
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
};

export default Table;