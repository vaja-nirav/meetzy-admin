import { Switch } from '@headlessui/react'
import { cn } from '../../utils/cn'

export default function Toggle({ checked, onChange, label, danger = false }) {
  return (
    <Switch.Group as="div" className="flex items-center gap-3">
      <Switch
        checked={checked}
        onChange={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
          checked
            ? danger
              ? 'bg-meetzy-red'
              : 'bg-meetzy-purple'
            : 'bg-meetzy-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </Switch>
      {label && (
        <Switch.Label className="text-meetzy-text text-sm cursor-pointer">
          {label}
        </Switch.Label>
      )}
    </Switch.Group>
  )
}
