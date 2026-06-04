import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { Tab } from '@headlessui/react'
import {
  Search, Eye, ShieldOff, Shield, Crown, Coins, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { usersApi } from '../api/users.api'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import Drawer from '../components/ui/Drawer'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate, formatFullDate, formatNumber, getInitials, getAvatarColor } from '../utils/format'
import { cn } from '../utils/cn'

function UserAvatar({ user, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-xs'
  if (user?.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={user.displayName}
        className={`${sizeClass} rounded-full object-cover`}
      />
    )
  }
  const name = user?.displayName || '?'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}

function StatusBadge({ status, isVip, isOnline }) {
  // Banned takes priority; otherwise show real online/offline presence (+ VIP marker).
  if (status === 'banned') return <Badge variant="danger">Banned</Badge>
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={isOnline ? 'success' : 'gray'}>
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      {isVip && <Badge variant="gold">👑 VIP</Badge>}
    </span>
  )
}

function BanModal({ isOpen, onClose, user, onSubmit, loading }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { action: 'ban', reason: '' },
  })
  const action = watch('action')

  useEffect(() => { if (!isOpen) reset() }, [isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ban User — ${user?.displayName || ''}`} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          {['ban', 'unban'].map((a) => (
            <label
              key={a}
              className={cn(
                'flex-1 text-center py-2 rounded-xl cursor-pointer border transition-colors capitalize text-sm font-medium',
                action === a
                  ? a === 'ban'
                    ? 'bg-red-500/20 border-meetzy-red text-meetzy-red'
                    : 'bg-green-500/20 border-meetzy-green text-meetzy-green'
                  : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted'
              )}
            >
              <input type="radio" value={a} {...register('action')} className="sr-only" />
              {a === 'ban' ? '🚫 Ban' : '✅ Unban'}
            </label>
          ))}
        </div>
        {action === 'ban' && (
          <div>
            <label className="block text-meetzy-muted text-sm mb-1">Reason *</label>
            <textarea
              rows={3}
              placeholder="Enter ban reason..."
              className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none resize-none"
              {...register('reason', { required: action === 'ban' ? 'Reason is required' : false })}
            />
            {errors.reason && <p className="text-meetzy-red text-xs mt-1">{errors.reason.message}</p>}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-meetzy-red hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            🚫 Confirm
          </button>
        </div>
      </form>
    </Modal>
  )
}

function VipModal({ isOpen, onClose, user, onSubmit, loading }) {
  const [duration, setDuration] = useState(30)
  const options = [{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }, { label: 'Lifetime', value: 36500 }]

  useEffect(() => { if (!isOpen) setDuration(30) }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`VIP — ${user?.displayName || ''}`} size="sm">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={cn(
                'py-2.5 rounded-xl text-sm font-medium border transition-colors',
                duration === opt.value
                  ? 'bg-meetzy-purple border-meetzy-purple text-white'
                  : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium">Cancel</button>
          <button
            onClick={() => onSubmit(duration)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            👑 Grant VIP
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CoinsModal({ isOpen, onClose, user, onSubmit, loading }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { action: 'credit', amount: '', reason: '' },
  })
  const action = watch('action')

  useEffect(() => { if (!isOpen) reset() }, [isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Coins — ${user?.displayName || ''}`} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          {['credit', 'debit'].map((a) => (
            <label
              key={a}
              className={cn(
                'flex-1 text-center py-2 rounded-xl cursor-pointer border transition-colors text-sm font-medium',
                action === a
                  ? a === 'credit'
                    ? 'bg-green-500/20 border-meetzy-green text-meetzy-green'
                    : 'bg-red-500/20 border-meetzy-red text-meetzy-red'
                  : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted'
              )}
            >
              <input type="radio" value={a} {...register('action')} className="sr-only" />
              {a === 'credit' ? '➕ Credit' : '➖ Debit'}
            </label>
          ))}
        </div>
        <div>
          <label className="block text-meetzy-muted text-sm mb-1">Amount *</label>
          <input
            type="number"
            min="1"
            placeholder="100"
            className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
            {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Minimum 1' } })}
          />
          {errors.amount && <p className="text-meetzy-red text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-meetzy-muted text-sm mb-1">Reason *</label>
          <input
            type="text"
            placeholder="Enter reason..."
            className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
            {...register('reason', { required: 'Reason is required' })}
          />
          {errors.reason && <p className="text-meetzy-red text-xs mt-1">{errors.reason.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-meetzy-purple hover:bg-purple-700 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            💰 Confirm
          </button>
        </div>
      </form>
    </Modal>
  )
}

function UserDetailDrawer({ user, isOpen, onClose, onOpenModal }) {
  const tabLabels = ['Profile', 'Wallet', 'Calls', 'Reports']

  if (!user) return null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center pb-4 border-b border-meetzy-border">
          <UserAvatar user={user} size="lg" />
          <h3 className="text-white font-bold text-xl mt-3">{user.displayName}</h3>
          <p className="text-meetzy-muted text-sm">{user.countryCode || '—'}</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <StatusBadge status={user.status} isVip={user.isVip} isOnline={user.isOnline} />
            {user.isProfileComplete ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge variant="gray">Incomplete</Badge>
            )}
          </div>
        </div>

        <Tab.Group>
          <Tab.List className="flex gap-1 border-b border-meetzy-border">
            {tabLabels.map((label) => (
              <Tab
                key={label}
                className={({ selected }) =>
                  cn(
                    'px-3 py-2 text-sm font-medium transition-colors outline-none',
                    selected
                      ? 'border-b-2 border-meetzy-purple text-white'
                      : 'text-meetzy-muted hover:text-white'
                  )
                }
              >
                {label}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel className="space-y-3">
              {[
                ['Email', user.email],
                ['Gender', user.gender || '—'],
                ['Age', user.age || '—'],
                ['Country', user.country || '—'],
                ['Member Since', formatFullDate(user.createdAt)],
                ['Last Seen', formatDate(user.lastSeenAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-meetzy-muted text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
              {user.bio && (
                <div>
                  <span className="text-meetzy-muted text-sm">Bio</span>
                  <p className="text-white text-sm mt-1">{user.bio}</p>
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-meetzy-hover rounded-xl p-4 text-center mb-4">
                <p className="text-meetzy-gold text-2xl font-bold">
                  💰 {formatNumber(user.coins || 0)} coins
                </p>
              </div>
              {user.recentTransactions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-meetzy-muted text-xs uppercase tracking-wider">Last 5 Transactions</p>
                  {user.recentTransactions.slice(0, 5).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-meetzy-border/50">
                      <Badge variant={tx.type === 'credit' ? 'success' : 'danger'}>
                        {tx.type === 'credit' ? '➕' : '➖'} {tx.amount}
                      </Badge>
                      <span className="text-meetzy-muted text-xs">{tx.reason}</span>
                      <span className="text-meetzy-muted text-xs">{formatDate(tx.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              {user.recentCalls?.length > 0 ? (
                <div className="space-y-3">
                  {user.recentCalls.slice(0, 5).map((call, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-meetzy-border/50">
                      <UserAvatar user={call.partner} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{call.partner?.displayName || '—'}</p>
                        <p className="text-meetzy-muted text-xs">{formatDate(call.createdAt)}</p>
                      </div>
                      <span className="text-meetzy-muted text-xs">{call.duration || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-meetzy-muted text-sm text-center py-8">No calls yet</p>
              )}
            </Tab.Panel>

            <Tab.Panel>
              {(user.reportsReceived || 0) > 0 && (
                <Badge variant="danger" className="mb-3">
                  {user.reportsReceived} reports received
                </Badge>
              )}
              {user.reports?.length > 0 ? (
                <div className="space-y-3">
                  {user.reports.map((report, i) => (
                    <div key={i} className="bg-meetzy-hover rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="danger">{report.reason}</Badge>
                        <span className="text-meetzy-muted text-xs">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-meetzy-muted text-xs">{report.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-meetzy-muted text-sm text-center py-8">No reports</p>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <div className="flex gap-2 pt-4 border-t border-meetzy-border">
          <button
            onClick={() => onOpenModal('ban', user)}
            className="flex-1 py-2 rounded-xl bg-red-500/20 text-meetzy-red text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            🚫 Ban
          </button>
          <button
            onClick={() => onOpenModal('vip', user)}
            className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-meetzy-gold text-sm font-medium hover:bg-yellow-500/30 transition-colors"
          >
            👑 VIP
          </button>
          <button
            onClick={() => onOpenModal('coins', user)}
            className="flex-1 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-colors"
          >
            💰 Coins
          </button>
        </div>
      </div>
    </Drawer>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ search: '', gender: '', status: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [modalUser, setModalUser] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getUsers(filters),
    placeholderData: keepPreviousData,
  })

  const users = data?.users || data?.data || []
  const total = data?.total || 0

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const banMutation = useMutation({
    mutationFn: ({ userId, action, reason }) => usersApi.banUser(userId, action, reason),
    onSuccess: () => {
      toast.success('User updated successfully')
      invalidateUsers()
      setModalType(null)
    },
    onError: () => toast.error('Failed to update user'),
  })

  const vipMutation = useMutation({
    mutationFn: ({ userId, durationDays }) => usersApi.updateVip(userId, 'grant', durationDays),
    onSuccess: () => {
      toast.success('VIP granted successfully')
      invalidateUsers()
      setModalType(null)
    },
    onError: () => toast.error('Failed to update VIP'),
  })

  const coinsMutation = useMutation({
    mutationFn: ({ userId, action, amount, reason }) =>
      usersApi.updateCoins(userId, action, amount, reason),
    onSuccess: () => {
      toast.success('Coins updated successfully')
      invalidateUsers()
      setModalType(null)
    },
    onError: () => toast.error('Failed to update coins'),
  })

  const openModal = (type, user) => {
    setModalType(type)
    setModalUser(user)
  }

  const openDrawer = (user) => {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row} />
          <div>
            <p className="text-white text-sm font-medium">{row.displayName}</p>
            <p className="text-meetzy-muted text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (row) => (
        <span className={cn('text-sm', row.gender === 'female' ? 'text-pink-400' : row.gender === 'male' ? 'text-blue-400' : 'text-meetzy-muted')}>
          {row.gender || '—'}
        </span>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (row) => (
        <span className="text-meetzy-text text-sm">{row.countryCode || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} isVip={row.isVip} isOnline={row.isOnline} />,
    },
    {
      key: 'totalCalls',
      header: 'Calls',
      render: (row) => <span className="text-meetzy-text">{formatNumber(row.totalCalls)}</span>,
    },
    {
      key: 'coins',
      header: 'Wallet',
      render: (row) => <span className="text-meetzy-gold text-sm">💰 {formatNumber(row.coins)}</span>,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row) => <span className="text-meetzy-muted text-sm">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openDrawer(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-white hover:bg-meetzy-hover transition-colors"
            title="View"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => openModal('ban', row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-meetzy-red hover:bg-red-500/10 transition-colors"
            title={row.status === 'banned' ? 'Unban' : 'Ban'}
          >
            {row.status === 'banned' ? <Shield size={15} /> : <ShieldOff size={15} />}
          </button>
          <button
            onClick={() => openModal('vip', row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-meetzy-gold hover:bg-yellow-500/10 transition-colors"
            title="VIP"
          >
            <Crown size={15} />
          </button>
          <button
            onClick={() => openModal('coins', row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
            title="Coins"
          >
            <Coins size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">
        Manage all registered users, bans, VIP, and wallet.
      </p>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-meetzy-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
            />
          </div>
          <select
            value={filters.gender}
            onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <p className="text-meetzy-muted text-sm mt-3">
          Showing {formatNumber(total)} users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
        emptyIcon={Users}
      />

      <div className="mt-4">
        <Pagination
          total={total}
          page={filters.page}
          limit={20}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      </div>

      <UserDetailDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenModal={openModal}
      />

      <BanModal
        isOpen={modalType === 'ban'}
        onClose={() => setModalType(null)}
        user={modalUser}
        loading={banMutation.isPending}
        onSubmit={(data) =>
          banMutation.mutate({ userId: modalUser?._id, action: data.action, reason: data.reason })
        }
      />

      <VipModal
        isOpen={modalType === 'vip'}
        onClose={() => setModalType(null)}
        user={modalUser}
        loading={vipMutation.isPending}
        onSubmit={(days) =>
          vipMutation.mutate({ userId: modalUser?._id, durationDays: days })
        }
      />

      <CoinsModal
        isOpen={modalType === 'coins'}
        onClose={() => setModalType(null)}
        user={modalUser}
        loading={coinsMutation.isPending}
        onSubmit={(data) =>
          coinsMutation.mutate({
            userId: modalUser?._id,
            action: data.action,
            amount: Number(data.amount),
            reason: data.reason,
          })
        }
      />
    </div>
  )
}
