import React from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Flame, BarChart3, Bell, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: Flame },
  { to: '/focus', label: 'Focus', icon: Flame },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User }
]

export default function BottomNav(){
  return (
    <nav className="fixed bottom-4 left-0 right-0 md:hidden flex justify-around px-4" aria-label="Bottom navigation">
      <div className="w-full max-w-md mx-auto rounded-full bg-black/50 backdrop-blur border border-white/10 px-2 py-2 flex justify-between">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} aria-label={label} className="flex flex-col items-center gap-1 text-[11px] text-muted px-2 py-1 rounded-full hover:text-white">
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
