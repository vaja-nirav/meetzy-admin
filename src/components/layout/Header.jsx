import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { format } from 'date-fns'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/calls': 'Video Calls',
  '/reports': 'Reports',
  '/transactions': 'Wallet & Transactions',
  '/queue': 'Live Queue',
  '/vip': 'VIP Management',
  '/config': 'App Config',
  '/blocked': 'Blocked Users',
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const pageTitle = routeTitles[location.pathname] || 'Meetzy Admin'

  return (
    <header className="h-16 bg-meetzy-sidebar/80 backdrop-blur-sm border-b border-meetzy-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-meetzy-muted hover:text-white hover:bg-meetzy-hover transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-white font-semibold">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-meetzy-muted text-sm hidden sm:block">
          {format(time, "EEE, MMM dd • HH:mm:ss")}
        </span>
        <div className="h-4 w-px bg-meetzy-border hidden sm:block" />
        <span className="bg-meetzy-purple/20 text-meetzy-purple border border-meetzy-purple/30 px-3 py-1 rounded-full text-xs font-medium">
          ADMIN
        </span>
        <div className="w-8 h-8 rounded-full bg-meetzy-purple flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
      </div>
    </header>
  )
}
