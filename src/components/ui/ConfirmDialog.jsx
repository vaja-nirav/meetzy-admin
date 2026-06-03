import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  danger = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            danger ? 'bg-red-500/20' : 'bg-orange-500/20'
          }`}
        >
          <AlertTriangle size={24} className={danger ? 'text-red-400' : 'text-orange-400'} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-meetzy-muted text-sm mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-meetzy-hover text-white text-sm font-medium hover:bg-meetzy-border transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-meetzy-red hover:bg-red-600'
                : 'bg-meetzy-purple hover:bg-purple-700'
            }`}
          >
            {loading && <LoadingSpinner size="sm" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
