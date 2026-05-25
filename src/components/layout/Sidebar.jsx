import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Flame, BarChart3, Bell, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: Flame },
  { to: '/focus', label: 'Focus', icon: Flame },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User }
]

export default function Sidebar(){
  return (
    <aside className="w-20 md:w-64 p-4 hidden md:block" aria-label="Primary navigation">
      <div className="space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) => `flex items-center gap-3 rounded-btn px-3 py-2 transition ${isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/5 hover:text-white'}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
