import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Video, Flag,
  Wallet, Radio, Crown, Settings, Ban,
  LogOut, Zap, Image, Sparkles, Film,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/calls', icon: Video, label: 'Video Calls' },
  { path: '/reports', icon: Flag, label: 'Reports' },
  { path: '/transactions', icon: Wallet, label: 'Wallet' },
  { path: '/queue', icon: Radio, label: 'Live Queue' },
  { path: '/vip', icon: Crown, label: 'VIP' },
  { path: '/config', icon: Settings, label: 'App Config' },
  { path: '/blocked', icon: Ban, label: 'Blocked Users' },
  { path: '/mosaic', icon: Image, label: 'Login Mosaic' },
  { path: '/people', icon: Sparkles, label: 'People' },
  { path: '/videos', icon: Film, label: 'Videos' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth()

  const handleLogout = () => {
    toast.success('Logged out successfully')
    logout()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-meetzy-sidebar border-r border-meetzy-border">
      <div className="p-6 border-b border-meetzy-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-meetzy-purple flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Meetzy</h1>
            <p className="text-meetzy-muted text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 cursor-pointer border-l-2',
                isActive
                  ? 'bg-meetzy-hover border-meetzy-purple text-white'
                  : 'border-transparent text-meetzy-muted hover:bg-meetzy-hover hover:text-white'
              )
            }
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-meetzy-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mx-0 rounded-lg text-meetzy-muted hover:text-meetzy-red hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:flex w-64 flex-shrink-0 fixed left-0 top-0 h-screen z-30">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-64"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
