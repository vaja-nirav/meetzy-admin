import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  Plus, Trash2, Edit, Eye, EyeOff,
  Image as ImageIcon, Link as LinkIcon, Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { mosaicApi } from '../api/mosaic.api'
import { formatFullDate } from '../utils/format'
import { cn } from '../utils/cn'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const DEFAULT_FORM = {
  photoUrl: '',
  gender: '',
  status: 'active',
  showOnlineDot: true,
  order: 0,
}

// ── Small reusable pieces ───────────────────────────────────────────────────
function PhotoCircle({ url, sizeClass = 'w-10 h-10', iconSize = 16 }) {
  const [errored, setErrored] = useState(false)
  if (!url || errored) {
    return (
      <div className={cn(sizeClass, 'rounded-full bg-meetzy-hover flex items-center justify-center text-meetzy-muted')}>
        <ImageIcon size={iconSize} />
      </div>
    )
  }
  return (
    <img
      src={url}
      alt=""
      className={cn(sizeClass, 'rounded-full object-cover')}
      onError={() => setErrored(true)}
    />
  )
}

function GenderText({ gender }) {
  const map = {
    female: 'text-pink-400',
    male: 'text-blue-400',
    other: 'text-meetzy-muted',
  }
  const label = gender ? gender[0].toUpperCase() + gender.slice(1) : '—'
  return <span className={cn('text-sm', map[gender] || 'text-meetzy-muted')}>{label}</span>
}

function StatusBadge({ status }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 px-3 py-1 rounded-full text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inactive
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

// ── Add / Edit form modal ───────────────────────────────────────────────────
function EntryFormModal({
  isOpen, mode, form, setForm, photoTab, setPhotoTab,
  errors, onSubmit, onClose, loading,
}) {
  const isEdit = mode === 'edit'

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, photoUrl: reader.result }))
    reader.readAsDataURL(file)
  }

  const inputCls =
    'w-full bg-meetzy-hover border text-meetzy-text rounded-xl px-4 py-3 focus:border-meetzy-purple focus:outline-none transition-colors text-sm'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit mosaic entry' : 'Add mosaic entry'} size="md">
      <div className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4">
          {form.photoUrl ? (
            <PhotoCircle url={form.photoUrl} sizeClass="w-16 h-16" iconSize={22} />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-meetzy-border flex items-center justify-center text-meetzy-muted">
              ?
            </div>
          )}
          <p className="text-meetzy-muted text-sm">Shown as a face on the login screen.</p>
        </div>

        {/* Photo source tabs */}
        <div>
          <div className="flex bg-meetzy-hover rounded-xl p-1 mb-3">
            <button
              type="button"
              onClick={() => setPhotoTab('url')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                photoTab === 'url' ? 'bg-meetzy-purple text-white' : 'text-meetzy-muted'
              )}
            >
              <LinkIcon size={15} /> Paste URL
            </button>
            <button
              type="button"
              onClick={() => setPhotoTab('upload')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                photoTab === 'upload' ? 'bg-meetzy-purple text-white' : 'text-meetzy-muted'
              )}
            >
              <Upload size={15} /> Upload file
            </button>
          </div>

          {photoTab === 'url' ? (
            <input
              type="text"
              value={form.photoUrl.startsWith('data:') ? '' : form.photoUrl}
              onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              className={cn(inputCls, errors.photoUrl ? 'border-meetzy-red' : 'border-meetzy-border')}
            />
          ) : (
            <label className="block cursor-pointer">
              <div className={cn(
                'border-2 border-dashed rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-meetzy-muted hover:border-meetzy-purple transition-colors',
                errors.photoUrl ? 'border-meetzy-red' : 'border-meetzy-border'
              )}>
                <Upload size={22} />
                <span className="text-sm">Click to upload or drag</span>
                <span className="text-xs">JPG, PNG, GIF up to 10MB</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
          {errors.photoUrl && <p className="text-meetzy-red text-xs mt-1">{errors.photoUrl}</p>}
        </div>

        {/* Gender + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className={cn(inputCls, errors.gender ? 'border-meetzy-red' : 'border-meetzy-border')}
            >
              <option value="">—</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-meetzy-red text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              className={cn(inputCls, 'border-meetzy-border')}
            />
          </div>
        </div>

        {/* Status (edit only) */}
        {isEdit && (
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Status</label>
            <div className="flex gap-2">
              {['active', 'inactive'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-colors',
                    form.status === s
                      ? s === 'active'
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-gray-500/20 border-gray-500/40 text-gray-300'
                      : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Online dot */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.showOnlineDot}
            onChange={(e) => setForm((f) => ({ ...f, showOnlineDot: e.target.checked }))}
            className="w-4 h-4 accent-meetzy-purple"
          />
          <span className="text-meetzy-text text-sm">Active — show the green online dot on this face</span>
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium hover:bg-meetzy-border transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-purple hover:bg-purple-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            {isEdit ? 'Save changes' : 'Add entry'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MosaicPage() {
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({ status: 'all', gender: 'all', page: 1 })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [photoTab, setPhotoTab] = useState('url')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['mosaic', filters],
    queryFn: () => mosaicApi.getAll(filters),
    placeholderData: keepPreviousData,
  })

  const entries = data?.data?.entries || []
  const stats = data?.data?.stats || {}

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['mosaic'] })

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: mosaicApi.create,
    onSuccess: () => {
      toast.success('Entry added successfully!')
      invalidate()
      closeModals()
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add entry'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => mosaicApi.update(id, payload),
    onSuccess: () => {
      toast.success('Entry updated!')
      invalidate()
      closeModals()
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update entry'),
  })

  const deleteMutation = useMutation({
    mutationFn: mosaicApi.delete,
    onSuccess: () => {
      toast.success('Entry deleted!')
      invalidate()
      setDeleteConfirmOpen(false)
      setSelectedEntry(null)
    },
    onError: () => toast.error('Failed to delete entry'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => mosaicApi.updateStatus(id, status),
    onSuccess: (_res, vars) => {
      toast.success(`Entry ${vars.status === 'active' ? 'activated' : 'deactivated'}!`)
      invalidate()
    },
    onError: () => toast.error('Failed to update status'),
  })

  // ── Helpers ──
  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setPhotoTab('url')
    setErrors({})
  }

  const closeModals = () => {
    setAddModalOpen(false)
    setEditModalOpen(false)
    resetForm()
  }

  const openAddModal = () => {
    resetForm()
    setAddModalOpen(true)
  }

  const openEditModal = (entry) => {
    setSelectedEntry(entry)
    setForm({
      photoUrl: entry.photoUrl || '',
      gender: entry.gender || '',
      status: entry.status || 'active',
      showOnlineDot: entry.showOnlineDot ?? true,
      order: entry.order ?? 0,
    })
    setPhotoTab('url')
    setErrors({})
    setEditModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.photoUrl) e.photoUrl = 'Photo is required'
    if (!form.gender) e.gender = 'Please select a gender'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submitAdd = () => {
    if (!validate()) return
    createMutation.mutate({ ...form, order: Number(form.order) || 0 })
  }

  const submitEdit = () => {
    if (!validate()) return
    updateMutation.mutate({ id: selectedEntry.id, data: { ...form, order: Number(form.order) || 0 } })
  }

  const activeCount = stats.active ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Login Mosaic</h1>
          <p className="text-meetzy-muted text-sm mt-1">
            Manage floating user photos on the login screen
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatPill label="Total" value={stats.total} color="text-white" />
        <StatPill label="● Active" value={stats.active} color="text-green-400" />
        <StatPill label="Inactive" value={stats.inactive} color="text-meetzy-red" />
        <StatPill label="Female" value={stats.female} color="text-pink-400" />
        <StatPill label="Male" value={stats.male} color="text-blue-400" />
      </div>

      {/* Filter bar */}
      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.gender}
            onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <span className="text-meetzy-muted text-sm ml-auto">
            {stats.total ?? 0} entries · {activeCount} active (green dot)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-meetzy-hover">
              {['Photo', 'Gender', 'Status', 'Order', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-meetzy-border/50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="animate-pulse h-6 bg-meetzy-hover rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <ImageIcon size={40} className="text-meetzy-muted opacity-40" />
                    <div>
                      <p className="text-white font-medium">No mosaic entries yet</p>
                      <p className="text-meetzy-muted text-sm">Add photos to show on the login screen</p>
                    </div>
                    <button
                      onClick={openAddModal}
                      className="mt-2 bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
                    >
                      <Plus size={16} /> Add First Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-meetzy-border/50 hover:bg-meetzy-hover/50 transition-colors">
                  <td className="px-4 py-3">
                    <PhotoCircle url={entry.photoUrl} />
                  </td>
                  <td className="px-4 py-3"><GenderText gender={entry.gender} /></td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-meetzy-text text-sm">{entry.order}</td>
                  <td className="px-4 py-3 text-meetzy-muted text-sm">{formatFullDate(entry.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {entry.status === 'active' ? (
                        <button
                          title="Deactivate"
                          onClick={() => statusMutation.mutate({ id: entry.id, status: 'inactive' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"
                        >
                          <EyeOff size={15} />
                        </button>
                      ) : (
                        <button
                          title="Activate"
                          onClick={() => statusMutation.mutate({ id: entry.id, status: 'active' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-green-400 transition-colors flex items-center justify-center"
                        >
                          <Eye size={15} />
                        </button>
                      )}
                      <button
                        title="Edit"
                        onClick={() => openEditModal(entry)}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-purple transition-colors flex items-center justify-center"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => { setSelectedEntry(entry); setDeleteConfirmOpen(true) }}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      <EntryFormModal
        isOpen={addModalOpen}
        mode="add"
        form={form}
        setForm={setForm}
        photoTab={photoTab}
        setPhotoTab={setPhotoTab}
        errors={errors}
        onSubmit={submitAdd}
        onClose={closeModals}
        loading={createMutation.isPending}
      />

      {/* Edit modal */}
      <EntryFormModal
        isOpen={editModalOpen}
        mode="edit"
        form={form}
        setForm={setForm}
        photoTab={photoTab}
        setPhotoTab={setPhotoTab}
        errors={errors}
        onSubmit={submitEdit}
        onClose={closeModals}
        loading={updateMutation.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedEntry?.id)}
        title="Delete Entry"
        message="This entry will be removed from the login screen permanently."
        danger
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
