import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionsApi } from '../api/transactions.api'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import { formatDate, formatNumber, getInitials, getAvatarColor } from '../utils/format'

const REASON_LABELS = {
  gift_sent: 'Gift Sent 🎁',
  gift_received: 'Gift Received 🎁',
  subscription: 'Subscription 👑',
  top_up: 'Top Up 💳',
  admin_bonus: 'Admin Bonus 🎉',
  admin_deduct: 'Admin Deducted',
  new_user_bonus: 'Welcome Bonus 🎊',
  call_cost: 'Call Cost 📹',
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

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ type: '', dateFrom: '', dateTo: '', search: '', page: 1 })
  const [pendingFilters, setPendingFilters] = useState({ type: '', dateFrom: '', dateTo: '', search: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getTransactions(filters),
    placeholderData: keepPreviousData,
  })

  const transactions = data?.transactions || data?.data || []
  const total = data?.total || 0
  const stats = data?.stats || {}

  const columns = [
    {
      key: 'index',
      header: '#',
      render: (_, idx) => <span className="text-meetzy-muted">{idx + 1}</span>,
    },
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row.user} />
          <span className="text-white text-sm">{row.user?.displayName || '—'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge variant={row.type === 'credit' ? 'success' : 'danger'}>
          {row.type === 'credit' ? '➕ Credit' : '➖ Debit'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="text-meetzy-gold font-semibold">💰 {formatNumber(row.amount)}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <span className="text-meetzy-text text-sm">
          {REASON_LABELS[row.reason] || row.reason || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => <span className="text-meetzy-muted text-sm">{formatDate(row.createdAt)}</span>,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Wallet & Transactions</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">Track all coin credits and debits.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Transactions"
          value={formatNumber(stats.total)}
          icon={Wallet}
          color="purple"
        />
        <StatCard
          title="Total Credits"
          value={formatNumber(stats.totalCredits)}
          icon={TrendingUp}
          color="green"
          subtitle="coins credited"
        />
        <StatCard
          title="Total Debits"
          value={formatNumber(stats.totalDebits)}
          icon={TrendingDown}
          color="red"
          subtitle="coins debited"
        />
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={pendingFilters.dateFrom}
            onChange={(e) => setPendingFilters((p) => ({ ...p, dateFrom: e.target.value }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          />
          <input
            type="date"
            value={pendingFilters.dateTo}
            onChange={(e) => setPendingFilters((p) => ({ ...p, dateTo: e.target.value }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          />
          <select
            value={pendingFilters.type}
            onChange={(e) => setPendingFilters((p) => ({ ...p, type: e.target.value }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input
            type="text"
            placeholder="🔍 Search user..."
            value={pendingFilters.search}
            onChange={(e) => setPendingFilters((p) => ({ ...p, search: e.target.value }))}
            className="flex-1 min-w-[160px] px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          />
          <button
            onClick={() => setFilters({ ...pendingFilters, page: 1 })}
            className="px-5 py-2.5 bg-meetzy-purple hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        loading={isLoading}
        emptyMessage="No transactions found"
        emptyIcon={Wallet}
      />

      <div className="mt-4">
        <Pagination
          total={total}
          page={filters.page}
          limit={20}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  )
}
