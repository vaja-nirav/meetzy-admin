import { cn } from '../../utils/cn'

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export default function LoadingSpinner({ size = 'md', fullScreen = false, className }) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-meetzy-border border-t-meetzy-purple',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-meetzy-bg/50 z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
