import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  Plus, Trash2, Edit, Eye, EyeOff, Film, Play,
  Upload, Link as LinkIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { videosApi } from '../api/videos.api'
import { formatFullDate } from '../utils/format'
import { cn } from '../utils/cn'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'

const PAGE_SIZE = 20
const API_BASE = process.env.REACT_APP_API_URL || ''
const CATEGORIES = ['all', 'male', 'female', 'static']
const CAT_STYLE = {
  all: 'bg-meetzy-purple/20 text-meetzy-purple border-meetzy-purple/30',
  male: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  female: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  static: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}
const DEFAULT_FORM = { url: '', category: 'all', status: 'active' }
const inputCls =
  'w-full bg-meetzy-hover border text-meetzy-text rounded-xl px-4 py-3 focus:border-meetzy-purple focus:outline-none transition-colors text-sm'

const previewSrc = (url) => (url && url.startsWith('/uploads') ? API_BASE + url : url)

function StatusBadge({ status }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 px-3 py-1 rounded-full text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive
    </span>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="bg-meetzy-card border border-meetzy-border px-4 py-2 rounded-xl text-sm flex items-center gap-2">
      <span className="text-meetzy-muted">{label}</span>
      <span className={cn('font-semibold', color)}>{value ?? 0}</span>
    </div>
  )
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────
function VideoFormModal({ isOpen, mode, form, setForm, errors, onSubmit, onClose, loading }) {
  const isEdit = mode === 'edit'
  const [tab, setTab] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { toast.error('Please choose a video file'); return }
    setUploading(true); setProgress(0)
    try {
      const res = await videosApi.upload(file, setProgress)
      set('url', res.url)
      toast.success('Video uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false); e.target.value = ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit video' : 'Add video'} size="md">
      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => set('category', c)}
                className={cn('px-3 py-1.5 rounded-xl text-sm font-medium capitalize border transition-colors',
                  form.category === c ? CAT_STYLE[c] : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted')}>
                {c}
              </button>
            ))}
          </div>
          <p className="text-meetzy-muted text-xs mt-1">
            {form.category === 'static' ? 'Shown during first-time onboarding.' : `Shown when no live user (filter: ${form.category}).`}
          </p>
        </div>

        {/* Source tabs */}
        <div>
          <div className="flex bg-meetzy-hover rounded-xl p-1 mb-3">
            <button type="button" onClick={() => setTab('url')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'url' ? 'bg-meetzy-purple text-white' : 'text-meetzy-muted')}>
              <LinkIcon size={15} /> Paste URL
            </button>
            <button type="button" onClick={() => setTab('upload')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'upload' ? 'bg-meetzy-purple text-white' : 'text-meetzy-muted')}>
              <Upload size={15} /> Upload file
            </button>
          </div>

          {tab === 'url' ? (
            <input type="text" value={form.url} onChange={(e) => set('url', e.target.value)}
              placeholder="https://example.com/video.mp4"
              className={cn(inputCls, errors.url ? 'border-meetzy-red' : 'border-meetzy-border')} />
          ) : (
            <label className="block cursor-pointer">
              <div className={cn('border-2 border-dashed rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-meetzy-muted hover:border-meetzy-purple transition-colors',
                errors.url ? 'border-meetzy-red' : 'border-meetzy-border')}>
                {uploading ? (
                  <><LoadingSpinner size="sm" /><span className="text-sm">Uploading… {progress}%</span></>
                ) : (
                  <><Upload size={22} /><span className="text-sm">Click to upload a video</span><span className="text-xs">MP4 up to 200MB</span></>
                )}
              </div>
              <input type="file" accept="video/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          )}
          {errors.url && <p className="text-meetzy-red text-xs mt-1">{errors.url}</p>}
        </div>

        {/* Preview */}
        {form.url && (
          <video src={previewSrc(form.url)} controls muted className="w-full max-h-48 rounded-xl bg-black" />
        )}

        {/* Status (edit only) */}
        {isEdit && (
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Status</label>
            <div className="flex gap-2">
              {['active', 'inactive'].map((s) => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={cn('flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-colors',
                    form.status === s
                      ? s === 'active' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-300'
                      : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading || uploading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium hover:bg-meetzy-border transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={loading || uploading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-purple hover:bg-purple-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {loading && <LoadingSpinner size="sm" />}
            {isEdit ? 'Save changes' : 'Add video'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function VideosPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ category: 'all_categories', status: 'all', page: 1, limit: PAGE_SIZE })
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['videos', filters],
    queryFn: () => videosApi.getAll(filters),
    placeholderData: keepPreviousData,
  })
  const entries = data?.data || []
  const stats = data?.stats || {}
  const total = data?.pagination?.total || 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['videos'] })

  const createMutation = useMutation({
    mutationFn: videosApi.create,
    onSuccess: () => { toast.success('Video added!'); invalidate(); close() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add video'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => videosApi.update(id, payload),
    onSuccess: () => { toast.success('Video updated!'); invalidate(); close() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update video'),
  })
  const deleteMutation = useMutation({
    mutationFn: videosApi.delete,
    onSuccess: () => { toast.success('Video deleted!'); invalidate(); setDeleteOpen(false); setSelected(null) },
    onError: () => toast.error('Failed to delete video'),
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => videosApi.updateStatus(id, status),
    onSuccess: (_r, v) => { toast.success(`Video ${v.status === 'active' ? 'enabled' : 'disabled'}!`); invalidate() },
    onError: () => toast.error('Failed to update status'),
  })

  const reset = () => { setForm(DEFAULT_FORM); setErrors({}) }
  const close = () => { setAddOpen(false); setEditOpen(false); reset() }
  const openAdd = () => { reset(); setAddOpen(true) }
  const openEdit = (v) => { setSelected(v); setForm({ url: v.url || '', category: v.category, status: v.status }); setErrors({}); setEditOpen(true) }

  const validate = () => {
    const e = {}
    if (!form.url.trim()) e.url = 'A video URL or upload is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const submitAdd = () => { if (validate()) createMutation.mutate({ url: form.url.trim(), category: form.category }) }
  const submitEdit = () => { if (validate()) updateMutation.mutate({ id: selected.id, data: { url: form.url.trim(), category: form.category, status: form.status } }) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-meetzy-muted text-sm mt-1">Filler & onboarding videos shown when no live user is available</p>
        </div>
        <button onClick={openAdd} className="bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Video
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <StatPill label="Total" value={stats.total} color="text-white" />
        <StatPill label="All" value={stats.all} color="text-meetzy-purple" />
        <StatPill label="Male" value={stats.male} color="text-blue-400" />
        <StatPill label="Female" value={stats.female} color="text-pink-400" />
        <StatPill label="Static" value={stats.static} color="text-amber-400" />
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none">
            <option value="all_categories">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="text-meetzy-muted text-sm ml-auto">{total} videos</span>
        </div>
      </div>

      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-meetzy-hover">
              {['Preview', 'URL', 'Category', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-meetzy-border/50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><div className="animate-pulse h-6 bg-meetzy-hover rounded" /></td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Film size={40} className="text-meetzy-muted opacity-40" />
                    <div>
                      <p className="text-white font-medium">No videos yet</p>
                      <p className="text-meetzy-muted text-sm">Add filler/onboarding videos by URL or upload</p>
                    </div>
                    <button onClick={openAdd} className="mt-2 bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm">
                      <Plus size={16} /> Add First Video
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((v) => (
                <tr key={v.id} className="border-b border-meetzy-border/50 hover:bg-meetzy-hover/50 transition-colors">
                  <td className="px-4 py-3">
                    <a href={previewSrc(v.url)} target="_blank" rel="noreferrer"
                      className="w-12 h-9 rounded-lg bg-black flex items-center justify-center text-white hover:text-meetzy-purple" title="Play">
                      <Play size={16} />
                    </a>
                  </td>
                  <td className="px-4 py-3 max-w-[320px]">
                    <span className="text-meetzy-muted text-xs truncate block">{v.url}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border capitalize', CAT_STYLE[v.category])}>{v.category}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-meetzy-muted text-sm">{formatFullDate(v.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {v.status === 'active' ? (
                        <button title="Disable" onClick={() => statusMutation.mutate({ id: v.id, status: 'inactive' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"><EyeOff size={15} /></button>
                      ) : (
                        <button title="Enable" onClick={() => statusMutation.mutate({ id: v.id, status: 'active' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-green-400 transition-colors flex items-center justify-center"><Eye size={15} /></button>
                      )}
                      <button title="Edit" onClick={() => openEdit(v)}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-purple transition-colors flex items-center justify-center"><Edit size={15} /></button>
                      <button title="Delete" onClick={() => { setSelected(v); setDeleteOpen(true) }}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} page={filters.page} limit={PAGE_SIZE} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />

      <VideoFormModal isOpen={addOpen} mode="add" form={form} setForm={setForm} errors={errors} onSubmit={submitAdd} onClose={close} loading={createMutation.isPending} />
      <VideoFormModal isOpen={editOpen} mode="edit" form={form} setForm={setForm} errors={errors} onSubmit={submitEdit} onClose={close} loading={updateMutation.isPending} />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(selected?.id)}
        title="Delete Video"
        message="This video will be removed permanently."
        danger
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
