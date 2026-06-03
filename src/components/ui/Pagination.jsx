import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'

export default function Pagination({ total = 0, page = 1, limit = 20, onPageChange }) {
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPages = () => {
    const pages = []
    const min = Math.max(1, page - 2)
    const max = Math.min(totalPages, page + 2)
    for (let i = min; i <= max; i++) pages.push(i)
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-meetzy-muted text-sm">
        Showing {formatNumber(start)}–{formatNumber(end)} of {formatNumber(total)} results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-meetzy-card text-meetzy-muted hover:bg-meetzy-hover hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm transition-colors',
              p === page
                ? 'bg-meetzy-purple text-white'
                : 'bg-meetzy-card text-meetzy-muted hover:bg-meetzy-hover hover:text-white'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-meetzy-card text-meetzy-muted hover:bg-meetzy-hover hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
