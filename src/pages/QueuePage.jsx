import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Radio, Clock, RefreshCw, CheckCircle, Crown, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { queueApi } from '../api/queue.api'
import StatCard from '../components/ui/StatCard'
import LiveBadge from '../components/ui/LiveBadge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatNumber, getInitials, getAvatarColor } from '../utils/format'
import { useLiveTimer } from '../hooks/useLiveTimer'
import { cn } from '../utils/cn'

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

function WaitingTimer({ seconds }) {
  const time = useLiveTimer(seconds || 0)
  return <span className="text-meetzy-orange font-mono text-sm">{time}</span>
}

function QueueRow({ user, index, onRemove, removing }) {
  return (
    <tr className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors">
      <td className="px-4 py-4 text-meetzy-muted text-sm">{index}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <span className="text-white text-sm font-medium">{user.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className={cn('text-sm font-medium', user.gender === 'female' ? 'text-pink-400' : 'text-blue-400')}
        >
          {user.gender === 'female' ? '♀' : '♂'} {user.gender || '—'}
        </span>
      </td>
      <td className="px-4 py-4 text-meetzy-text text-sm">{user.countryCode || '—'}</td>
      <td className="px-4 py-4">
        {user.isVip ? (
          <Crown size={16} className="text-meetzy-gold" />
        ) : (
          <span className="text-meetzy-muted">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <WaitingTimer seconds={user.waitingSeconds} />
      </td>
      <td className="px-4 py-4">
        <button
          onClick={() => onRemove(user)}
          disabled={removing === (user._id || user.userId)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-meetzy-red hover:bg-red-500/30 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 size={12} />
          Remove
        </button>
      </td>
    </tr>
  )
}

export default function QueuePage() {
  const queryClient = useQueryClient()
  const [removeTarget, setRemoveTarget] = useState(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['queue'],
    queryFn: queueApi.getQueue,
    refetchInterval: 10000,
  })

  const removeMutation = useMutation({
    mutationFn: (userId) => queueApi.removeFromQueue(userId),
    onSuccess: () => {
      toast.success('User removed from queue')
      queryClient.invalidateQueries({ queryKey: ['queue'] })
      setRemoveTarget(null)
    },
    onError: () => toast.error('Failed to remove from queue'),
  })

  const queue = data?.queue || data?.users || data || []
  const avgWait = data?.avgWaitSeconds
    ? `${Math.floor(data.avgWaitSeconds / 60)}m ${data.avgWaitSeconds % 60}s`
    : '—'

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Live Queue</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">
        Monitor and manage the live matchmaking queue.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Users in Queue"
          value={formatNumber(Array.isArray(queue) ? queue.length : 0)}
          icon={Radio}
          color="red"
          subtitle="waiting for a match"
        />
        <StatCard
          title="Avg Wait Time"
          value={avgWait}
          icon={Clock}
          color="orange"
          subtitle="average wait"
        />
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-semibold text-lg">🔴 Live Matchmaking Queue</h2>
            <LiveBadge />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-meetzy-muted text-xs bg-meetzy-hover px-3 py-1 rounded-full">
              Auto refresh: 10s
            </span>
            <button
              onClick={() => refetch()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-white hover:bg-meetzy-hover transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-meetzy-hover rounded-xl" />
            ))}
          </div>
        ) : !Array.isArray(queue) || queue.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="Queue is empty"
            description="No users waiting for a match"
          />
        ) : (
          <div className="rounded-xl overflow-hidden border border-meetzy-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-meetzy-hover">
                    {['#', 'User', 'Gender', 'Country', 'VIP', 'Waiting', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queue.map((user, idx) => (
                    <QueueRow
                      key={user._id || user.userId || idx}
                      user={user}
                      index={idx + 1}
                      onRemove={setRemoveTarget}
                      removing={removeMutation.isPending ? removeTarget?._id : null}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeMutation.mutate(removeTarget?._id || removeTarget?.userId)}
        title="Remove from Queue"
        message={`Remove ${removeTarget?.displayName || 'this user'} from the matchmaking queue?`}
        confirmText="Remove"
        danger
        loading={removeMutation.isPending}
      />
    </div>
  )
}
