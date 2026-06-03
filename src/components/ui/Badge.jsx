import { cn } from '../../utils/cn'

const variantClasses = {
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  gold: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant] || variantClasses.gray,
        className
      )}
    >
      {children}
    </span>
  )
}
