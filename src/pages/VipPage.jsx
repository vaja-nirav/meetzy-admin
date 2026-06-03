import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Crown, Clock, XCircle, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { vipApi } from '../api/vip.api'
import { usersApi } from '../api/users.api'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { formatDate, formatFullDate, getDaysLeft, formatNumber, getInitials, getAvatarColor } from '../utils/format'
import { cn } from '../utils/cn'

const TABS = [
  { key: 'active', label: '👑 Active' },
  { key: 'expired', label: '❌ Expired' },
  { key: 'all', label: 'All' },
]

function DaysLeftBadge({ expiresAt, isLifetime }) {
  if (isLifetime) return <Badge variant="gold">♾️ Lifetime</Badge>
  if (!expiresAt) return <Badge variant="gray">—</Badge>
  const days = getDaysLeft(expiresAt)
  if (days === null) return <Badge variant="gray">—</Badge>
  if (days <= 0) return <Badge variant="danger">Expired</Badge>
  if (days <= 14) return <Badge variant="warning">{days} days ⚠️</Badge>
  return <Badge variant="success">{days} days</Badge>
}

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

function ExtendModal({ isOpen, onClose, user, onSubmit, loading }) {
  const [duration, setDuration] = useState(30)
  const options = [
    { label: '+7 Days', value: 7 },
    { label: '+30 Days', value: 30 },
    { label: '+90 Days', value: 90 },
    { label: 'Lifetime', value: 36500 },
  ]
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Extend VIP — ${user?.displayName || ''}`} size="sm">
      <div className="space-y-4">
        {user?.vipExpiresAt && (
          <div className="bg-meetzy-hover rounded-xl p-3 text-sm">
            <span className="text-meetzy-muted">Current expiry: </span>
            <span className="text-white font-medium">{formatFullDate(user.vipExpiresAt)}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={cn(
                'py-2.5 rounded-xl text-sm font-medium border transition-colors',
                duration === opt.value
                  ? 'bg-yellow-500 border-yellow-500 text-black'
                  : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(duration)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            👑 Extend VIP
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function VipPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('active')
  const [page, setPage] = useState(1)
  const [extendModal, setExtendModal] = useState(null)
  const [revokeModal, setRevokeModal] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vip', activeTab, page],
    queryFn: () => vipApi.getVipUsers({ status: activeTab === 'all' ? undefined : activeTab, page }),
  })

  const extendMutation = useMutation({
    mutationFn: ({ userId, durationDays }) => usersApi.updateVip(userId, 'grant', durationDays),
    onSuccess: () => {
      toast.success('VIP extended successfully')
      queryClient.invalidateQueries({ queryKey: ['vip'] })
      setExtendModal(null)
    },
    onError: () => toast.error('Failed to extend VIP'),
  })

  const revokeMutation = useMutation({
    mutationFn: (userId) => usersApi.updateVip(userId, 'revoke'),
    onSuccess: () => {
      toast.success('VIP revoked')
      queryClient.invalidateQueries({ queryKey: ['vip'] })
      setRevokeModal(null)
    },
    onError: () => toast.error('Failed to revoke VIP'),
  })

  const vipUsers = data?.users || data?.data || []
  const total = data?.total || 0
  const stats = data?.stats || {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">VIP Management</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">Manage VIP subscriptions and privileges.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active VIP" value={formatNumber(stats.active)} icon={Crown} color="gold" />
        <StatCard title="Expiring (7 Days)" value={formatNumber(stats.expiringSoon)} icon={Clock} color="orange" />
        <StatCard title="Expired This Week" value={formatNumber(stats.expiredThisWeek)} icon={XCircle} color="red" />
        <StatCard title="Total Granted" value={formatNumber(stats.totalGranted)} icon={BarChart2} color="purple" />
      </div>

      <div className="border-b border-meetzy-border mb-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={cn(
                'py-2 px-4 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === tab.key
                  ? 'border-b-2 border-meetzy-purple text-white bg-meetzy-hover'
                  : 'text-meetzy-muted hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-meetzy-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-meetzy-hover">
                {['#', 'User', 'Email', 'Country', 'VIP Since', 'Expires', 'Days Left', 'Actions'].map((h) => (
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
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="animate-pulse h-4 bg-meetzy-hover rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : vipUsers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={Crown} title="No VIP users found" />
                  </td>
                </tr>
              ) : (
                vipUsers.map((user, idx) => (
                  <tr key={user._id || idx} className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors">
                    <td className="px-4 py-4 text-meetzy-muted text-sm">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <span className="text-white text-sm font-medium">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-meetzy-muted text-sm">{user.email}</td>
                    <td className="px-4 py-4 text-meetzy-text text-sm">{user.countryCode || '—'}</td>
                    <td className="px-4 py-4 text-meetzy-muted text-sm">{formatDate(user.vipGrantedAt)}</td>
                    <td className="px-4 py-4 text-meetzy-text text-sm">
                      {user.isLifetimeVip ? '♾️ Never' : formatFullDate(user.vipExpiresAt)}
                    </td>
                    <td className="px-4 py-4">
                      <DaysLeftBadge expiresAt={user.vipExpiresAt} isLifetime={user.isLifetimeVip} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExtendModal(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-yellow-500/20 text-meetzy-gold text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                        >
                          ➕ Extend
                        </button>
                        <button
                          onClick={() => setRevokeModal(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-meetzy-red text-xs font-medium hover:bg-red-500/30 transition-colors"
                        >
                          ❌ Revoke
                        </button>
                      </div>
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

      <ExtendModal
        isOpen={!!extendModal}
        onClose={() => setExtendModal(null)}
        user={extendModal}
        loading={extendMutation.isPending}
        onSubmit={(days) =>
          extendMutation.mutate({ userId: extendModal?._id, durationDays: days })
        }
      />

      <ConfirmDialog
        isOpen={!!revokeModal}
        onClose={() => setRevokeModal(null)}
        onConfirm={() => revokeMutation.mutate(revokeModal?._id)}
        title="Revoke VIP"
        message={`Remove VIP from ${revokeModal?.displayName}?`}
        confirmText="Revoke VIP"
        danger
        loading={revokeMutation.isPending}
      />
    </div>
  )
}
