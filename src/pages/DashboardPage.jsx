import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Wifi, Video, UserPlus, Flag, Crown,
  ArrowLeftRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { configApi } from '../api/config.api'
import { callsApi } from '../api/calls.api'
import StatCard from '../components/ui/StatCard'
import LiveBadge from '../components/ui/LiveBadge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import UserGrowthChart from '../components/charts/UserGrowthChart'
import CallsChart from '../components/charts/CallsChart'
import GenderPieChart from '../components/charts/GenderPieChart'
import CountriesBarChart from '../components/charts/CountriesBarChart'
import { useLiveTimer } from '../hooks/useLiveTimer'
import { formatNumber } from '../utils/format'
import { getAvatarColor, getInitials } from '../utils/format'

function UserAvatar({ user, size = 8 }) {
  if (user?.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt={user.displayName}
        className={`w-${size} h-${size} rounded-full object-cover`}
      />
    )
  }
  const name = user?.displayName || '?'
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}

function ActiveCallRow({ call, onTerminate }) {
  const duration = useLiveTimer(call.durationSeconds || 0)
  return (
    <div className="flex items-center gap-3 py-3 border-b border-meetzy-border/50 last:border-0">
      <UserAvatar user={call.userA} size={8} />
      <span className="text-meetzy-text text-sm truncate max-w-[80px]">
        {call.userA?.displayName || 'User A'}
      </span>
      <ArrowLeftRight size={14} className="text-meetzy-muted flex-shrink-0" />
      <UserAvatar user={call.userB} size={8} />
      <span className="text-meetzy-text text-sm truncate max-w-[80px]">
        {call.userB?.displayName || 'User B'}
      </span>
      <span className="text-meetzy-muted text-xs ml-auto flex-shrink-0">{duration}</span>
      <button
        onClick={() => onTerminate(call)}
        className="flex-shrink-0 px-2 py-1 rounded-lg bg-red-500/20 text-meetzy-red hover:bg-red-500/30 text-xs font-medium transition-colors"
      >
        End
      </button>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-meetzy-hover rounded w-24" />
        <div className="w-12 h-12 bg-meetzy-hover rounded-xl" />
      </div>
      <div className="h-8 bg-meetzy-hover rounded w-20 mb-2" />
      <div className="h-3 bg-meetzy-hover rounded w-32" />
    </div>
  )
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [terminateTarget, setTerminateTarget] = useState(null)
  const [countdown, setCountdown] = useState(15)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: configApi.getStats,
    refetchInterval: 60000,
  })

  const { data: activeCallsData, isLoading: callsLoading } = useQuery({
    queryKey: ['active-calls'],
    queryFn: callsApi.getActiveCalls,
    refetchInterval: 15000,
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 15
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const activeCalls = activeCallsData?.calls || activeCallsData || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">
        Welcome back! Here's what's happening with Meetzy.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={formatNumber(stats?.totalUsers)}
              subtitle="All time"
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Online Now"
              value={formatNumber(stats?.onlineNow)}
              subtitle="Active users"
              icon={Wifi}
              color="green"
            />
            <StatCard
              title="Calls Today"
              value={formatNumber(stats?.callsToday)}
              subtitle="Video calls"
              icon={Video}
              color="blue"
            />
            <StatCard
              title="New Today"
              value={formatNumber(stats?.newToday)}
              subtitle="New registrations"
              icon={UserPlus}
              color="orange"
            />
            <StatCard
              title="Pending Reports"
              value={formatNumber(stats?.pendingReports)}
              subtitle="Needs review"
              icon={Flag}
              color="red"
            />
            <StatCard
              title="Active VIP"
              value={formatNumber(stats?.activeVip)}
              subtitle="VIP subscriptions"
              icon={Crown}
              color="gold"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">📈 User Growth — Last 7 Days</h3>
          {statsLoading ? (
            <div className="h-[250px] animate-pulse bg-meetzy-hover rounded-xl" />
          ) : (
            <UserGrowthChart data={stats?.userGrowth || []} />
          )}
        </div>
        <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">📹 Video Calls — Last 7 Days</h3>
          {statsLoading ? (
            <div className="h-[250px] animate-pulse bg-meetzy-hover rounded-xl" />
          ) : (
            <CallsChart data={stats?.callsHistory || []} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Gender Distribution</h3>
          <GenderPieChart data={stats?.genderStats || {}} />
        </div>

        <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Top 5 Countries</h3>
          <CountriesBarChart data={stats?.topCountries || []} />
        </div>

        <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LiveBadge />
              <h3 className="text-white font-semibold">Active Calls Now</h3>
            </div>
            <span className="text-meetzy-muted text-xs">
              Refreshing in {countdown}s
            </span>
          </div>

          {callsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-meetzy-hover rounded-lg" />
              ))}
            </div>
          ) : activeCalls.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No active calls"
              description="Nobody is calling right now"
            />
          ) : (
            <div>
              {activeCalls.map((call) => (
                <ActiveCallRow
                  key={call.roomId || call._id}
                  call={call}
                  onTerminate={setTerminateTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        onConfirm={() => terminateMutation.mutate(terminateTarget?.roomId || terminateTarget?._id)}
        title="Terminate Call"
        message="Are you sure you want to end this call?"
        confirmText="Terminate"
        danger
        loading={terminateMutation.isPending}
      />
    </div>
  )
}
