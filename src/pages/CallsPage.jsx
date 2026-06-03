import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Video, Clock, Activity, Calendar, StopCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { callsApi } from '../api/calls.api'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import LiveBadge from '../components/ui/LiveBadge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { useLiveTimer } from '../hooks/useLiveTimer'
import { formatDate, formatDuration, formatNumber, getInitials, getAvatarColor } from '../utils/format'
import { cn } from '../utils/cn'

function UserAvatar({ user }) {
  if (user?.photoUrl) {
    return <img src={user.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
  }
  const name = user?.displayName || '?'
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}

function ActiveCallRow({ call, onTerminate }) {
  const duration = useLiveTimer(call.durationSeconds || 0)
  return (
    <tr className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors">
      <td className="px-4 py-3 text-meetzy-muted text-sm">#</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <UserAvatar user={call.userA} />
          <span className="text-white text-sm">{call.userA?.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-meetzy-muted">↔</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <UserAvatar user={call.userB} />
          <span className="text-white text-sm">{call.userB?.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-meetzy-purple font-mono text-sm">{duration}</span>
      </td>
      <td className="px-4 py-3 text-meetzy-muted text-sm">{formatDate(call.startedAt)}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onTerminate(call)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-meetzy-red hover:bg-red-500/30 text-xs font-medium transition-colors"
        >
          <StopCircle size={12} />
          Terminate
        </button>
      </td>
    </tr>
  )
}

function ReasonBadge({ reason }) {
  const map = {
    user_ended: { label: 'Ended', variant: 'success' },
    partner_left: { label: 'Swiped', variant: 'warning' },
    disconnected: { label: 'Disconnected', variant: 'gray' },
    admin_terminated: { label: 'Terminated', variant: 'danger' },
  }
  const config = map[reason] || { label: reason || '—', variant: 'gray' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function CallsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ search: '', dateFrom: '', dateTo: '', page: 1 })
  const [pendingFilters, setPendingFilters] = useState({ search: '', dateFrom: '', dateTo: '' })
  const [expandedRow, setExpandedRow] = useState(null)
  const [terminateTarget, setTerminateTarget] = useState(null)

  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ['active-calls'],
    queryFn: callsApi.getActiveCalls,
    refetchInterval: 15000,
  })

  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ['calls', filters],
    queryFn: () => callsApi.getCalls(filters),
  })

  const terminateMutation = useMutation({
    mutationFn: (roomId) => callsApi.terminateCall(roomId),
    onSuccess: () => {
      toast.success('Call terminated')
      queryClient.invalidateQueries({ queryKey: ['active-calls'] })
      setTerminateTarget(null)
    },
    onError: () => toast.error('Failed to terminate call'),
  })

  const activeCalls = activeData?.calls || activeData || []
  const calls = callsData?.calls || callsData?.data || []
  const total = callsData?.total || 0
  const statsData = callsData?.stats || {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Video Calls</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">Monitor live and historical video calls.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Calls" value={formatNumber(statsData.total)} icon={Video} color="purple" />
        <StatCard title="Avg Duration" value={statsData.avgDuration ? formatDuration(statsData.avgDuration) : '—'} icon={Clock} color="blue" />
        <StatCard title="Active Now" value={formatNumber(activeCalls.length)} icon={Activity} color="red" />
        <StatCard title="Today" value={formatNumber(statsData.today)} icon={Calendar} color="green" />
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <LiveBadge />
          <h3 className="text-white font-semibold">Live Active Calls</h3>
          <span className="ml-auto text-meetzy-muted text-xs bg-meetzy-hover px-3 py-1 rounded-full">
            Auto refreshes every 15s
          </span>
        </div>

        {activeLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-meetzy-hover rounded-lg" />
            ))}
          </div>
        ) : activeCalls.length === 0 ? (
          <EmptyState icon={Video} title="No active calls" description="All quiet right now" />
        ) : (
          <div className="rounded-xl overflow-hidden border border-meetzy-border">
            <table className="w-full">
              <thead>
                <tr className="bg-meetzy-hover">
                  {['#', 'User A', '', 'User B', 'Duration', 'Started', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeCalls.map((call) => (
                  <ActiveCallRow
                    key={call.roomId || call._id}
                    call={call}
                    onTerminate={setTerminateTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">📋 All Calls History</h3>

        <div className="flex flex-wrap gap-3 mb-4">
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
          <input
            type="text"
            placeholder="Search by username..."
            value={pendingFilters.search}
            onChange={(e) => setPendingFilters((p) => ({ ...p, search: e.target.value }))}
            className="flex-1 min-w-[180px] px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          />
          <button
            onClick={() => setFilters({ ...pendingFilters, page: 1 })}
            className="px-5 py-2.5 bg-meetzy-purple hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-meetzy-border">
          <table className="w-full">
            <thead>
              <tr className="bg-meetzy-hover">
                {['#', 'User A', 'User B', 'Duration', 'Started', 'Ended', 'Reason'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {callsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-meetzy-border/50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="animate-pulse h-4 bg-meetzy-hover rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Video} title="No calls found" description="Try adjusting filters" />
                  </td>
                </tr>
              ) : (
                calls.map((call, idx) => (
                  <>
                    <tr
                      key={call._id || idx}
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                      className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 text-meetzy-muted text-sm">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={call.userA} />
                          <span className="text-white text-sm">{call.userA?.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={call.userB} />
                          <span className="text-white text-sm">{call.userB?.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-meetzy-text text-sm font-mono">
                        {formatDuration(call.durationSeconds)}
                      </td>
                      <td className="px-4 py-4 text-meetzy-muted text-sm">{formatDate(call.startedAt)}</td>
                      <td className="px-4 py-4 text-meetzy-muted text-sm">{formatDate(call.endedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ReasonBadge reason={call.endReason} />
                          <ChevronDown
                            size={14}
                            className={cn(
                              'text-meetzy-muted transition-transform',
                              expandedRow === idx && 'rotate-180'
                            )}
                          />
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === idx && (
                        <tr key={`expand-${idx}`}>
                          <td colSpan={7} className="bg-meetzy-hover/50 px-4 py-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
                            >
                              <div>
                                <p className="text-meetzy-muted text-xs">Room ID</p>
                                <p className="text-white font-mono text-xs mt-0.5">{call.roomId || '—'}</p>
                              </div>
                              <div>
                                <p className="text-meetzy-muted text-xs">Started</p>
                                <p className="text-white text-xs mt-0.5">{call.startedAt ? new Date(call.startedAt).toLocaleString() : '—'}</p>
                              </div>
                              <div>
                                <p className="text-meetzy-muted text-xs">Ended</p>
                                <p className="text-white text-xs mt-0.5">{call.endedAt ? new Date(call.endedAt).toLocaleString() : '—'}</p>
                              </div>
                              <div>
                                <p className="text-meetzy-muted text-xs">User A Rating</p>
                                <p className="text-white text-xs mt-0.5">{call.ratingA ?? '—'} / 5</p>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            total={total}
            page={filters.page}
            limit={20}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        onConfirm={() => terminateMutation.mutate(terminateTarget?.roomId || terminateTarget?._id)}
        title="Terminate Call"
        message="Are you sure you want to force-end this call?"
        confirmText="Terminate"
        danger
        loading={terminateMutation.isPending}
      />
    </div>
  )
}
