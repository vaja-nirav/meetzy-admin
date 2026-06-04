import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  Plus, Trash2, Edit, Eye, EyeOff, BadgeCheck,
  Image as ImageIcon, Upload, Link as LinkIcon, X, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { peopleApi } from '../api/people.api'
import { formatFullDate } from '../utils/format'
import { cn } from '../utils/cn'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MAX_IMAGES = 6
const DEFAULT_FORM = {
  user_name: '',
  age: '',
  blue_tick: false,
  country_id: '',
  about_me: '',
  languages: [],
  cover_images: [],
  status: 'active',
  order: 0,
}

// ── Reusable bits ────────────────────────────────────────────────────────────
function CoverThumb({ url, sizeClass = 'w-10 h-10', iconSize = 16 }) {
  const [errored, setErrored] = useState(false)
  if (!url || errored) {
    return (
      <div className={cn(sizeClass, 'rounded-lg bg-meetzy-hover flex items-center justify-center text-meetzy-muted')}>
        <ImageIcon size={iconSize} />
      </div>
    )
  }
  return <img src={url} alt="" className={cn(sizeClass, 'rounded-lg object-cover')} onError={() => setErrored(true)} />
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

const inputCls =
  'w-full bg-meetzy-hover border text-meetzy-text rounded-xl px-4 py-3 focus:border-meetzy-purple focus:outline-none transition-colors text-sm'

// ── Languages chips input ────────────────────────────────────────────────────
function LanguagesInput({ value, onChange }) {
  const [text, setText] = useState('')
  const add = () => {
    const v = text.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setText('')
  }
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((lang, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-meetzy-purple/20 text-meetzy-purple border border-meetzy-purple/30 px-2.5 py-1 rounded-full text-xs">
            {lang}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a language, press Enter"
          className={cn(inputCls, 'border-meetzy-border')}
        />
        <button type="button" onClick={add} className="px-3 rounded-xl bg-meetzy-hover text-white text-sm border border-meetzy-border">Add</button>
      </div>
    </div>
  )
}

// ── Cover images input (up to 6, URL + upload) ───────────────────────────────
function CoverImagesInput({ images, onChange, error }) {
  const [url, setUrl] = useState('')
  const addUrl = () => {
    if (!url.trim()) return
    if (images.length >= MAX_IMAGES) { toast.error(`Max ${MAX_IMAGES} images`); return }
    onChange([...images, url.trim()])
    setUrl('')
  }
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (images.length >= MAX_IMAGES) { toast.error(`Max ${MAX_IMAGES} images`); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return }
    const reader = new FileReader()
    reader.onload = () => onChange([...images, reader.result])
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-meetzy-muted text-xs font-medium uppercase tracking-wider">Cover Images ({images.length}/{MAX_IMAGES})</label>
      </div>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square">
            <CoverThumb url={img} sizeClass="w-full h-full" iconSize={18} />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-meetzy-red text-white flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-meetzy-border flex items-center justify-center text-meetzy-muted cursor-pointer hover:border-meetzy-purple transition-colors">
            <Upload size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-meetzy-muted" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
            placeholder="Paste image URL"
            disabled={images.length >= MAX_IMAGES}
            className={cn(inputCls, 'border-meetzy-border pl-9 disabled:opacity-50')}
          />
        </div>
        <button type="button" onClick={addUrl} disabled={images.length >= MAX_IMAGES} className="px-3 rounded-xl bg-meetzy-hover text-white text-sm border border-meetzy-border disabled:opacity-50">Add</button>
      </div>
      {error && <p className="text-meetzy-red text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────
function EntryFormModal({ isOpen, mode, form, setForm, countries, errors, onSubmit, onClose, loading }) {
  const isEdit = mode === 'edit'
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit profile' : 'Add profile'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Name</label>
            <input value={form.user_name} onChange={(e) => set('user_name', e.target.value)} placeholder="e.g. Nikku"
              className={cn(inputCls, errors.user_name ? 'border-meetzy-red' : 'border-meetzy-border')} />
            {errors.user_name && <p className="text-meetzy-red text-xs mt-1">{errors.user_name}</p>}
          </div>
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Age</label>
            <input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="18–99"
              className={cn(inputCls, errors.age ? 'border-meetzy-red' : 'border-meetzy-border')} />
            {errors.age && <p className="text-meetzy-red text-xs mt-1">{errors.age}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Country</label>
            <select value={form.country_id} onChange={(e) => set('country_id', e.target.value)}
              className={cn(inputCls, errors.country_id ? 'border-meetzy-red' : 'border-meetzy-border')}>
              <option value="">— Select —</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
            {errors.country_id && <p className="text-meetzy-red text-xs mt-1">{errors.country_id}</p>}
          </div>
          <div>
            <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Order</label>
            <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)}
              className={cn(inputCls, 'border-meetzy-border')} />
          </div>
        </div>

        <div>
          <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">About</label>
          <textarea rows={3} value={form.about_me} onChange={(e) => set('about_me', e.target.value)} placeholder="Short bio shown on the profile…"
            className={cn(inputCls, 'border-meetzy-border resize-none')} />
        </div>

        <div>
          <label className="block text-meetzy-muted text-xs font-medium mb-2 uppercase tracking-wider">Languages</label>
          <LanguagesInput value={form.languages} onChange={(v) => set('languages', v)} />
        </div>

        <CoverImagesInput images={form.cover_images} onChange={(v) => set('cover_images', v)} error={errors.cover_images} />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.blue_tick} onChange={(e) => set('blue_tick', e.target.checked)} className="w-4 h-4 accent-meetzy-purple" />
            <span className="text-meetzy-text text-sm inline-flex items-center gap-1"><BadgeCheck size={15} className="text-blue-400" /> Blue tick (verified)</span>
          </label>

          {isEdit && (
            <div className="flex gap-2">
              {['active', 'inactive'].map((s) => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-colors',
                    form.status === s
                      ? s === 'active' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-300'
                      : 'bg-meetzy-hover border-meetzy-border text-meetzy-muted')}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium hover:bg-meetzy-border transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-meetzy-purple hover:bg-purple-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {loading && <LoadingSpinner size="sm" />}
            {isEdit ? 'Save changes' : 'Add profile'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PeoplePage() {
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({ status: 'all', country_id: '', search: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['people', filters],
    queryFn: () => peopleApi.getAll(filters),
    placeholderData: keepPreviousData,
  })
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: peopleApi.getCountries,
    staleTime: Infinity,
  })

  const entries = data?.data || []
  const stats = data?.stats || {}

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['people'] })

  const createMutation = useMutation({
    mutationFn: peopleApi.create,
    onSuccess: () => { toast.success('Profile added!'); invalidate(); closeModals() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add profile'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => peopleApi.update(id, payload),
    onSuccess: () => { toast.success('Profile updated!'); invalidate(); closeModals() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update profile'),
  })
  const deleteMutation = useMutation({
    mutationFn: peopleApi.delete,
    onSuccess: () => { toast.success('Profile deleted!'); invalidate(); setDeleteConfirmOpen(false); setSelectedEntry(null) },
    onError: () => toast.error('Failed to delete profile'),
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => peopleApi.updateStatus(id, status),
    onSuccess: (_r, v) => { toast.success(`Profile ${v.status === 'active' ? 'shown' : 'hidden'}!`); invalidate() },
    onError: () => toast.error('Failed to update status'),
  })

  const resetForm = () => { setForm(DEFAULT_FORM); setErrors({}) }
  const closeModals = () => { setAddModalOpen(false); setEditModalOpen(false); resetForm() }
  const openAddModal = () => { resetForm(); setAddModalOpen(true) }
  const openEditModal = (entry) => {
    setSelectedEntry(entry)
    setForm({
      user_name: entry.user_name || '',
      age: entry.age ?? '',
      blue_tick: entry.blue_tick ?? false,
      country_id: entry.country?.id || '',
      about_me: entry.about_me || '',
      languages: entry.languages || [],
      cover_images: entry.cover_images || [],
      status: entry.status || 'active',
      order: entry.order ?? 0,
    })
    setErrors({})
    setEditModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.user_name.trim()) e.user_name = 'Name is required'
    const age = Number(form.age)
    if (!form.age || !Number.isFinite(age) || age < 18 || age > 99) e.age = 'Age must be 18–99'
    if (!form.country_id) e.country_id = 'Country is required'
    if (form.cover_images.length > MAX_IMAGES) e.cover_images = `Max ${MAX_IMAGES} images`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const payload = () => ({
    user_name: form.user_name.trim(),
    age: Number(form.age),
    blue_tick: form.blue_tick,
    country_id: Number(form.country_id),
    about_me: form.about_me,
    languages: form.languages,
    cover_images: form.cover_images,
    order: Number(form.order) || 0,
  })

  const submitAdd = () => { if (validate()) createMutation.mutate(payload()) }
  const submitEdit = () => { if (validate()) updateMutation.mutate({ id: selectedEntry.id, data: { ...payload(), status: form.status } }) }

  const onSearch = (e) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">People</h1>
          <p className="text-meetzy-muted text-sm mt-1">Manage the profiles shown on the app's People page</p>
        </div>
        <button onClick={openAddModal} className="bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Profile
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatPill label="Total" value={stats.total} color="text-white" />
        <StatPill label="● Active" value={stats.active} color="text-green-400" />
        <StatPill label="Inactive" value={stats.inactive} color="text-meetzy-red" />
        <StatPill label="Verified" value={stats.blue_tick} color="text-blue-400" />
      </div>

      {/* Filters */}
      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filters.country_id} onChange={(e) => setFilters((f) => ({ ...f, country_id: e.target.value, page: 1 }))}
            className="px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none">
            <option value="">All Countries</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </select>
          <form onSubmit={onSearch} className="flex-1 min-w-[180px] flex gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="🔍 Search by name…"
              className="flex-1 px-4 py-2.5 bg-meetzy-hover border border-meetzy-border rounded-xl text-meetzy-text text-sm focus:border-meetzy-purple outline-none" />
            <button type="submit" className="px-5 py-2.5 bg-meetzy-purple hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">Search</button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-meetzy-card border border-meetzy-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-meetzy-hover">
              {['Photo', 'Name', 'Age', 'Country', 'Languages', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-meetzy-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-meetzy-border/50">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><div className="animate-pulse h-6 bg-meetzy-hover rounded" /></td>
                  ))}
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Sparkles size={40} className="text-meetzy-muted opacity-40" />
                    <div>
                      <p className="text-white font-medium">No profiles yet</p>
                      <p className="text-meetzy-muted text-sm">Add profiles to show on the app's People page</p>
                    </div>
                    <button onClick={openAddModal} className="mt-2 bg-meetzy-purple hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm">
                      <Plus size={16} /> Add First Profile
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-meetzy-border/50 hover:bg-meetzy-hover/50 transition-colors">
                  <td className="px-4 py-3"><CoverThumb url={entry.cover_images?.[0]} /></td>
                  <td className="px-4 py-3">
                    <span className="text-white text-sm font-medium inline-flex items-center gap-1">
                      {entry.user_name}
                      {entry.blue_tick && <BadgeCheck size={14} className="text-blue-400" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-meetzy-text text-sm">{entry.age}</td>
                  <td className="px-4 py-3 text-meetzy-text text-sm">{entry.country ? `${entry.country.flag} ${entry.country.name}` : '—'}</td>
                  <td className="px-4 py-3 text-meetzy-muted text-sm">{(entry.languages || []).join(', ') || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-meetzy-muted text-sm">{formatFullDate(entry.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {entry.status === 'active' ? (
                        <button title="Hide from app" onClick={() => statusMutation.mutate({ id: entry.id, status: 'inactive' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"><EyeOff size={15} /></button>
                      ) : (
                        <button title="Show in app" onClick={() => statusMutation.mutate({ id: entry.id, status: 'active' })}
                          className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-green-400 transition-colors flex items-center justify-center"><Eye size={15} /></button>
                      )}
                      <button title="Edit" onClick={() => openEditModal(entry)}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-purple transition-colors flex items-center justify-center"><Edit size={15} /></button>
                      <button title="Delete" onClick={() => { setSelectedEntry(entry); setDeleteConfirmOpen(true) }}
                        className="w-8 h-8 rounded-lg hover:bg-meetzy-hover text-meetzy-muted hover:text-meetzy-red transition-colors flex items-center justify-center"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EntryFormModal isOpen={addModalOpen} mode="add" form={form} setForm={setForm} countries={countries} errors={errors} onSubmit={submitAdd} onClose={closeModals} loading={createMutation.isPending} />
      <EntryFormModal isOpen={editModalOpen} mode="edit" form={form} setForm={setForm} countries={countries} errors={errors} onSubmit={submitEdit} onClose={closeModals} loading={updateMutation.isPending} />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedEntry?.id)}
        title="Delete Profile"
        message={`"${selectedEntry?.user_name || 'This profile'}" will be removed permanently.`}
        danger
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
