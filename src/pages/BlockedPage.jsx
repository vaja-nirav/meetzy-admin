import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ban, AlertTriangle, Search, ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { blockedApi } from '../api/blocked.api'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'
import { formatDate, formatNumber, getInitials, getAvatarColor } from '../utils/format'

function UserAvatar({ user }) {
  if (user?.photoUrl) return <img src={user.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
  const name = user?.displayName || '?'
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}

function TimesBlockedBadge({ count }) {
  if (!count) return <Badge variant="gray">0 times</Badge>
  if (count >= 6) return <Badge variant="danger">{count} times 🚨</Badge>
  if (count >= 3) return <Badge variant="warning">{count} times ⚠️</Badge>
  return <Badge variant="gray">{count} times</Badge>
}

export default function BlockedPage() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [removeTarget, setRemoveTarget] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useQuery({
    queryKey: ['blocked', search, page],
    queryFn: () => blockedApi.getBlocked({ search, page }),
  })

  const removeMutation = useMutation({
    mutationFn: (blockId) => blockedApi.removeBlock(blockId),
    onSuccess: () => {
      toast.success('Block removed')
      queryClient.invalidateQueries({ queryKey: ['blocked'] })
      setRemoveTarget(null)
    },
    onError: () => toast.error('Failed to remove block'),
  })

  const blocks = data?.blocks || data?.data || []
  const total = data?.total || 0
  const stats = data?.stats || {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Blocked Users</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">View and manage user block relationships.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Total Blocks"
          value={formatNumber(stats.total || total)}
          icon={Ban}
          color="red"
        />
        <StatCard
          title="Most Blocked User"
          value={stats.mostBlocked?.displayName || '—'}
          subtitle={stats.mostBlocked ? `${stats.mostBlocked.timesBlocked} times blocked` : ''}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-meetzy-muted" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-meetzy-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-meetzy-hover">
                {['#', 'Blocker', '', 'Blocked', 'Times Blocked', 'Date', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-meetzy-border/50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="animate-pulse h-4 bg-meetzy-hover rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : blocks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Ban} title="No blocks found" description="Try adjusting your search" />
                  </td>
                </tr>
              ) : (
                blocks.map((block, idx) => (
                  <tr key={block._id || idx} className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors">
                    <td className="px-4 py-4 text-meetzy-muted text-sm">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={block.blocker} />
                        <span className="text-white text-sm font-medium">{block.blocker?.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <ArrowRight size={16} className="text-meetzy-muted" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={block.blocked} />
                        <div>
                          <span className="text-white text-sm font-medium block">
                            {block.blocked?.displayName}
                          </span>
                          {(block.blocked?.timesBlocked || 0) >= 6 && (
                            <Link
                              to="/reports"
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              View Reports →
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <TimesBlockedBadge count={block.blocked?.timesBlocked} />
                    </td>
                    <td className="px-4 py-4 text-meetzy-muted text-sm whitespace-nowrap">
                      {formatDate(block.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setRemoveTarget(block)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-meetzy-red hover:bg-red-500/30 text-xs font-medium transition-colors"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination total={total} page={page} limit={20} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeMutation.mutate(removeTarget?._id)}
        title="Remove Block"
        message={`Remove the block between ${removeTarget?.blocker?.displayName} and ${removeTarget?.blocked?.displayName}?`}
        confirmText="Remove Block"
        danger
        loading={removeMutation.isPending}
      />
    </div>
  )
}
