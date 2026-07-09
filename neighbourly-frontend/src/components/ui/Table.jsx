const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found",
  className = "",
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">

          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap border-b border-slate-200 px-6 py-4 text-left text-sm font-semibold text-slate-700"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
            <tr>
                <td colSpan={columns.length} className="p-0">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    📄
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700">
                    No Records Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                    {emptyMessage}
                    </p>
                </div>
                </td>
            </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm text-slate-700"
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