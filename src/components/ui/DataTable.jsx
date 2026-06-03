import EmptyState from './EmptyState'

function SkeletonRow({ colCount }) {
  return (
    <tr className="border-b border-meetzy-border/50">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="animate-pulse bg-meetzy-hover rounded h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-meetzy-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-meetzy-hover">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyMessage}
                    description="Try adjusting your filters"
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4 text-sm text-meetzy-text whitespace-nowrap">
                      {col.render ? col.render(row, rowIndex) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
