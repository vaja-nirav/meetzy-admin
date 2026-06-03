export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-meetzy-border" />}
      <p className="text-meetzy-muted font-medium mt-4">{title}</p>
      {description && (
        <p className="text-meetzy-muted/70 text-sm mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
