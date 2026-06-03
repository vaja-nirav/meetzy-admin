import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Flag, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { reportsApi } from '../api/reports.api'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { formatDate, getInitials, getAvatarColor } from '../utils/format'
import { cn } from '../utils/cn'

const TABS = [
  { key: 'pending', label: '🟡 Pending' },
  { key: 'reviewed', label: '🔵 Reviewed' },
  { key: 'resolved', label: '✅ Resolved' },
  { key: 'all', label: 'All' },
]

const REASON_VARIANTS = {
  inappropriate_content: 'danger',
  harassment: 'warning',
  fake_profile: 'warning',
  spam: 'gray',
  underage: 'info',
  other: 'gray',
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

function ResolveModal({ isOpen, onClose, report, onSubmit, loading }) {
  const { register, handleSubmit, reset } = useForm()
  const handleClose = () => { reset(); onClose() }
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Resolve Report" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-meetzy-muted text-sm mb-1">Status</label>
          <select
            className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
            {...register('status', { required: true })}
          >
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-meetzy-muted text-sm mb-1">Admin Note</label>
          <textarea
            rows={3}
            placeholder="Optional note..."
            className="w-full bg-meetzy-hover border border-meetzy-border rounded-xl px-4 py-3 text-meetzy-text text-sm focus:border-meetzy-purple outline-none resize-none"
            {...register('adminNote')}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-meetzy-purple hover:bg-purple-700 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            ✅ Save
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pending')
  const [expandedRow, setExpandedRow] = useState(null)
  const [resolveModal, setResolveModal] = useState(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', activeTab, page],
    queryFn: () => reportsApi.getReports({ status: activeTab === 'all' ? undefined : activeTab, page }),
  })

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, status, adminNote }) =>
      reportsApi.updateReport(reportId, status, adminNote),
    onSuccess: () => {
      toast.success('Report updated')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setResolveModal(null)
    },
    onError: () => toast.error('Failed to update report'),
  })

  const reports = data?.reports || data?.data || []
  const total = data?.total || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Reports</h1>
      <p className="text-meetzy-muted text-sm mt-1 mb-6">Review and resolve user reports.</p>

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
              {data?.counts?.[tab.key] > 0 && (
                <span className="ml-1.5 bg-meetzy-purple/20 text-meetzy-purple text-xs px-1.5 py-0.5 rounded-full">
                  {data.counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-meetzy-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-meetzy-hover">
                {['#', 'Reporter', 'Reported', 'Reason', 'Description', 'Date', 'Status', 'Actions'].map((h) => (
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={Flag} title="No reports found" />
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <>
                    <tr
                      key={report._id || idx}
                      className="border-b border-meetzy-border/50 hover:bg-meetzy-hover transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    >
                      <td className="px-4 py-4 text-meetzy-muted text-sm">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={report.reporter} />
                          <span className="text-white text-sm">{report.reporter?.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={report.reported} />
                          <div>
                            <span className="text-white text-sm block">{report.reported?.displayName}</span>
                            {(report.reported?.timesReported || 0) >= 3 && (
                              <Badge variant="danger" className="mt-0.5">
                                ⚠️ {report.reported.timesReported} reports
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={REASON_VARIANTS[report.reason] || 'gray'}>
                          {report.reason?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-meetzy-muted text-sm max-w-[200px]">
                        <div className="flex items-center gap-1">
                          <span className="truncate">
                            {report.description?.slice(0, 60)}{report.description?.length > 60 ? '...' : ''}
                          </span>
                          <ChevronDown
                            size={12}
                            className={cn('flex-shrink-0 transition-transform', expandedRow === idx && 'rotate-180')}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-meetzy-muted text-sm whitespace-nowrap">{formatDate(report.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            report.status === 'resolved'
                              ? 'success'
                              : report.status === 'reviewed'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {report.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setResolveModal(report)}
                            className="px-2.5 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors whitespace-nowrap"
                          >
                            ✅ Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === idx && (
                        <tr key={`exp-${idx}`}>
                          <td colSpan={8} className="bg-meetzy-hover/40 px-6 py-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <p className="text-meetzy-muted text-xs uppercase tracking-wider mb-1">Full Description</p>
                              <p className="text-white text-sm">{report.description || '—'}</p>
                              {report.adminNote && (
                                <div className="mt-3">
                                  <p className="text-meetzy-muted text-xs uppercase tracking-wider mb-1">Admin Note</p>
                                  <p className="text-meetzy-text text-sm">{report.adminNote}</p>
                                </div>
                              )}
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
      </div>

      <div className="mt-4">
        <Pagination total={total} page={page} limit={20} onPageChange={setPage} />
      </div>

      <ResolveModal
        isOpen={!!resolveModal}
        onClose={() => setResolveModal(null)}
        report={resolveModal}
        loading={resolveMutation.isPending}
        onSubmit={(data) =>
          resolveMutation.mutate({
            reportId: resolveModal?._id,
            status: data.status,
            adminNote: data.adminNote,
          })
        }
      />
    </div>
  )
}
